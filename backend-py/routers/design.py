from fastapi import APIRouter, HTTPException
from uuid import uuid4
import requests

from models.design import (
    StartDesignRequest, StartDesignResponse, Variant, TextOverlay, TextItem, Bounds, CutoutAsset,
    HarmonizeRequest, HarmonizeResponse, BatchGenerationRequest, BatchGenerationResponse
)
from services.cloudinary_store import init_cloudinary, upload_image_bytes, public_id, save_manifest
from services.ai_flux import gradient_background, harmonize_img2img, generate_background
from services.context_manager import design_context
from services.quality_analyzer import analyze_generated_image
from services.text_optimizer import optimize_text_placement
from prompts.design_prompts import build_harmonize_prompt, build_bg_prompt

router = APIRouter()
init_cloudinary()

def _canvas_for(size: str):
    return {"w": 2048, "h": 2048} if size == "square" else {"w": 1080, "h": 1920}

@router.post("/start", response_model=StartDesignResponse)
def start_design(payload: StartDesignRequest):
    render_id = str(uuid4())
    campaign_id = payload.campaign_id
    sizes = payload.style_prefs.sizes or ["square"]
    palette = payload.style_prefs.palette or ["#222222", "#555555"]

    # Save context for later use in harmonization
    design_context.save_context(render_id, payload.event, payload.style_prefs)

    variants: list[Variant] = []
    for sz in sizes:
        # L1 background - try AI generation first, fallback to gradient
        try:
            bg_prompt = build_bg_prompt(
                title=payload.event.title,
                city=payload.event.city,
                genre=payload.event.genre,
                mood=payload.style_prefs.mood or "neon",
                palette=palette
            )
            bg_bytes = generate_background(bg_prompt, sz)
            bg_model = "FLUX.1-dev"
        except Exception as e:
            print(f"AI background generation failed: {e}, using gradient")
            bg_bytes = gradient_background(sz, palette)
            bg_model = "gradient_fallback"
        
        bg_url = upload_image_bytes(bg_bytes, public_id(campaign_id, render_id, f"bg_{sz}"))

        # Default L3 text overlay
        canvas = _canvas_for(sz)
        text_overlay = TextOverlay(
            canvas=canvas,
            text_items=[
                TextItem(kind="title", text=payload.event.title,
                         bounds=Bounds(x=120, y=120, w=canvas["w"]-240, h=240))
            ]
        )

        # Default L2 cutouts layout (simple grid)
        cutouts: list[CutoutAsset] = []
        x, y, z = 150, int(canvas["h"]*0.45), 1
        step_x = 220
        for art in payload.artists[:10]:
            cutouts.append(CutoutAsset(
                artist_id=art.id, url=art.cutout_url, bbox=(x, y, 400, 600), z=z, visible=True
            ))
            x += step_x; z += 1
            if x > canvas["w"] - 400:
                x, y = 150, y + 260

        variant = Variant(
            size=sz,
            layers={"l1_background_url": bg_url, "l2_composite_url": None},
            assets={"cutouts": cutouts},
            l3_text_overlay=text_overlay,
            meta={
                "seed_bg": "ai_generated",
                "model_bg": bg_model,
                "palette": ",".join(palette),
                "mood": payload.style_prefs.mood or "neon"
            }
        )
        variants.append(variant)

    # (Optional) save manifest for traceability
    manifest = {
        "render_id": render_id,
        "campaign_id": campaign_id,
        "variants": [v.model_dump(mode="json") for v in variants]
    }
    save_manifest(campaign_id, render_id, manifest)

    return StartDesignResponse(render_id=render_id, campaign_id=campaign_id, variants=variants)

@router.post("/harmonize", response_model=HarmonizeResponse)
def harmonize(payload: HarmonizeRequest):
    # Fetch background
    bg_resp = requests.get(payload.bg_url, timeout=60)
    if bg_resp.status_code != 200:
        raise HTTPException(400, "Failed to fetch background image")
    bg_bytes = bg_resp.content

    # Collect visible cutouts as bytes
    cutouts_data = []
    # Respect z ordering (low→high) so higher z pastes last; sort by z
    for sc in sorted(payload.selected_cutouts, key=lambda c: c.z):
        if not sc.visible:
            continue
        r = requests.get(sc.url, timeout=60)
        if r.status_code != 200:
            raise HTTPException(400, f"Failed to fetch cutout {sc.artist_id}")
        cutouts_data.append((r.content, sc.bbox))

    # Build harmonize prompt with saved event context for better accuracy
    try:
        context = design_context.extract_prompt_context(payload.render_id)
        harm_prompt = build_harmonize_prompt(
            city=context["city"], 
            mood=context["mood"], 
            genre=context["genre"], 
            palette=context["palette"]
        )
    except Exception as e:
        print(f"Context loading failed: {e}, using default prompt")
        # Fallback to simpler prompt if context loading fails
        harm_prompt = build_harmonize_prompt(city=None, mood=None)

    comp_bytes = harmonize_img2img(
        bg_bytes=bg_bytes,
        cutouts=cutouts_data,
        prompt=harm_prompt,
        strength=0.55,
        seed=payload.seed_harmonize,
        mood=context.get("mood", "neon")  # Pass mood for advanced processing
    )

    url = upload_image_bytes(comp_bytes, public_id(payload.campaign_id or "demo", payload.render_id, f"harmonized_{payload.size}"))

    return HarmonizeResponse(
        render_id=payload.render_id,
        size=payload.size,
        l2_composite_url=url,
        meta={"model_harmonize": "FLUX.1-Kontext-dev", "seed_harmonize": str(payload.seed_harmonize or "none")}
    )

@router.post("/analyze-quality")
def analyze_quality(payload: dict):
    """Analyze the quality of a generated image"""
    image_url = payload.get("image_url")
    if not image_url:
        raise HTTPException(400, "image_url is required")
    
    analysis = analyze_generated_image(image_url)
    
    return {
        "image_url": image_url,
        "analysis": analysis,
        "timestamp": payload.get("timestamp", "now")
    }

@router.post("/optimize-text-placement")
def optimize_text(payload: dict):
    """Optimize text placement based on background composition"""
    bg_url = payload.get("bg_url")
    size_type = payload.get("size", "square")
    
    if not bg_url:
        raise HTTPException(400, "bg_url is required")
    
    optimization = optimize_text_placement(bg_url, size_type)
    
    return {
        "bg_url": bg_url,
        "size": size_type,
        "optimization": optimization,
        "timestamp": payload.get("timestamp", "now")
    }

@router.post("/batch-generate", response_model=BatchGenerationResponse)
def batch_generate(payload: BatchGenerationRequest):
    """Generate multiple design variations simultaneously"""
    import time
    start_time = time.time()
    
    batch_id = str(uuid4())
    results = []
    
    # Process each style variation
    for i, style_prefs in enumerate(payload.style_variations[:payload.batch_size]):
        try:
            # Create individual request
            individual_request = StartDesignRequest(
                campaign_id=f"{payload.campaign_id}_batch_{batch_id}_{i}",
                event=payload.event,
                artists=payload.artists,
                style_prefs=style_prefs
            )
            
            # Generate design
            result = start_design(individual_request)
            results.append(result)
            
        except Exception as e:
            # Log error but continue with other variations
            print(f"Batch generation failed for variation {i}: {e}")
            continue
    
    processing_time = time.time() - start_time
    
    return BatchGenerationResponse(
        batch_id=batch_id,
        campaign_id=payload.campaign_id,
        results=results,
        processing_time=processing_time
    )
