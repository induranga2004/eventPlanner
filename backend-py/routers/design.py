from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
import re
from uuid import uuid4
import requests
from urllib.parse import urlparse

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

@router.get("/artists")
def list_artists(link: str = Query(..., description="Public Google Drive folder link or folder ID")):
    """List image-like files from a public Google Drive folder.
    Accepts either a full shared folder link or the folder ID. Returns a list of items with id and view url.
    Note: This uses best-effort HTML parsing; for production use the Drive API with an API key and CORS.
    """
    # Extract folder ID
    folder_id = None
    if re.match(r"^[a-zA-Z0-9_-]+$", link):
        folder_id = link
    else:
        try:
            parsed = urlparse(link)
            m = re.search(r"/folders/([a-zA-Z0-9_-]+)", parsed.path)
            if m:
                folder_id = m.group(1)
        except Exception:
            pass
    if not folder_id:
        raise HTTPException(422, "Invalid Google Drive folder link or id")

    # Try multiple folder render endpoints to maximize extraction success
    candidates = [
        f"https://drive.google.com/embeddedfolderview?id={folder_id}#grid",
        f"https://drive.google.com/folderview?id={folder_id}#grid",
        f"https://drive.google.com/drive/folders/{folder_id}",
    ]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
    }
    ids: set[str] = set()
    last_status = None
    for url in candidates:
        try:
            res = requests.get(url, timeout=60, headers=headers)
            last_status = res.status_code
            if res.status_code != 200:
                continue
            html = res.text
            # Extract IDs referenced in file links
            ids.update(re.findall(r"/file/d/([a-zA-Z0-9_-]+)", html))
            # Extract data-id occurrences (often used in embedded view)
            ids.update(re.findall(r"data-id=\"([a-zA-Z0-9_-]{10,})\"", html))
            # Some pages embed JSON with "id":"..."
            ids.update(re.findall(r'"id":"([a-zA-Z0-9_-]{10,})"', html))
            # If we found any, we can stop early
            if ids:
                break
        except requests.exceptions.RequestException:
            continue

    # Clean up any false positives (e.g., folder id itself)
    ids.discard(folder_id)

    items = []
    for i, fid in enumerate(sorted(ids)):
        view_url = f"https://drive.google.com/uc?export=view&id={fid}"
        thumb_url = f"https://drive.google.com/thumbnail?id={fid}"
        # Direct image bytes (good for display/download); add a size hint to improve quality
        raw_url = f"https://lh3.googleusercontent.com/d/{fid}=w2000"
        # Alternate direct download links
        dl_url = f"https://drive.google.com/uc?id={fid}&export=download"
        dl_url2 = f"https://drive.usercontent.google.com/download?id={fid}&export=view"
        items.append({
            "id": fid,
            "label": f"Asset {i+1}",
            "url": view_url,        # backward-compatible
            "view": view_url,
            "thumb": thumb_url,
            "raw": raw_url,
            "dl": dl_url,
            "dl2": dl_url2,
        })
        if len(items) >= 200:
            break

    return {
        "folder_id": folder_id,
        "count": len(items),
        "items": items,
        "source": "embeddedfolderview" if items else ("status:" + str(last_status))
    }

@router.get("/drive-image")
def drive_image(id: str, size: int = Query(800, ge=64, le=4000)):
    """Proxy a Google Drive image by ID to avoid browser CORS/referrer issues.
    Tries multiple direct endpoints and returns the first image content found.
    """
    candidates = [
        f"https://lh3.googleusercontent.com/d/{id}=w{size}",
        f"https://drive.google.com/uc?id={id}&export=download",
        f"https://drive.usercontent.google.com/download?id={id}&export=view",
        f"https://drive.google.com/uc?export=view&id={id}",
    ]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://drive.google.com/",
    }
    for url in candidates:
        try:
            r = requests.get(url, timeout=30, headers=headers)
            if r.status_code != 200:
                continue
            ct = r.headers.get("Content-Type", "")
            if not ct.startswith("image/"):
                continue
            # Optionally enforce a max size to prevent huge responses
            if len(r.content) > 15 * 1024 * 1024:  # 15MB limit
                continue
            return Response(content=r.content, media_type=ct, headers={
                "Cache-Control": "public, max-age=3600",
            })
        except requests.exceptions.RequestException:
            continue
    raise HTTPException(404, "Image not found or not publicly accessible")

@router.post("/harmonize", response_model=HarmonizeResponse)
def harmonize(payload: HarmonizeRequest):
    # Basic validation for bg_url to catch placeholders or missing chaining
    if not payload.bg_url:
        raise HTTPException(422, "bg_url is required. Run 'Design • Start (L1 Background)' first or provide a direct image URL.")
    if "REPLACE_WITH" in payload.bg_url or not re.match(r"^https?://", payload.bg_url):
        raise HTTPException(
            422,
            "bg_url looks invalid. Ensure it is a full http(s) URL. If you're using the Postman collection, run 'Design • Start (L1 Background)' first so it sets {{bg_url}} automatically."
        )
    # Fetch background
    try:
        bg_resp = requests.get(
            payload.bg_url,
            timeout=60,
            headers={"User-Agent": "Mozilla/5.0 (compatible; EventPlannerAI/1.0)"}
        )
    except requests.exceptions.RequestException as e:
        raise HTTPException(422, f"Failed to fetch background image: {e}")
    if bg_resp.status_code != 200:
        raise HTTPException(422, f"Failed to fetch background image (status {bg_resp.status_code})")
    bg_bytes = bg_resp.content

    # Collect visible cutouts as bytes
    cutouts_data = []
    # Respect z ordering (low→high) so higher z pastes last; sort by z
    for sc in sorted(payload.selected_cutouts, key=lambda c: c.z):
        if not sc.visible:
            continue
        try:
            r = requests.get(sc.url, timeout=60, headers={"User-Agent": "Mozilla/5.0 (compatible; EventPlannerAI/1.0)"})
            if r.status_code != 200:
                print(f"Warn: cutout fetch status {r.status_code} for {sc.artist_id}")
                continue
            cutouts_data.append((r.content, sc.bbox))
        except requests.exceptions.RequestException as e:
            print(f"Warn: cutout fetch failed for {sc.artist_id}: {e}")
            continue

    # Build harmonize prompt with saved event context for better accuracy
    # Default context in case extraction fails for any reason
    context = {"city": None, "mood": "neon", "genre": None, "palette": ["#9D00FF", "#00FFD1"]}
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
