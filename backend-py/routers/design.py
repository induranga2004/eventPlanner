from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
import re
import base64
import io
from uuid import uuid4
import random
from typing import Any, Dict, List, Optional, Tuple
import requests
from urllib.parse import urlparse
from PIL import Image

from models.design import (
    StartDesignRequest,
    StartDesignResponse,
    Variant,
    TextOverlay,
    TextItem,
    Bounds,
    CutoutAsset,
    HarmonizeRequest,
    HarmonizeResponse,
    BatchGenerationRequest,
    BatchGenerationResponse,
    BackgroundGenerationRequest,
    BackgroundGenerationResponse,
    BackgroundOption,
    SimpleHarmonizeRequest,
    SimpleHarmonizeResponse,
    HarmonizedImage,
    Artist,
    StylePrefs,
    Event,
)
from models.event_context import EventContext
from services.cloudinary_store import init_cloudinary, upload_image_bytes, public_id, save_manifest
from services.ai_flux import AI_ENABLE_FLUX, gradient_background, harmonize_img2img, generate_background
from services.context_manager import design_context
from services.quality_analyzer import analyze_generated_image
from services.text_optimizer import optimize_text_placement
from services.event_aware_prompts import (
    build_event_aware_bg_prompt,
    infer_genre_from_musicians,
    extract_city,
)
from routers.event_context import event_contexts
from prompts.design_prompts import build_harmonize_prompt, build_bg_prompt

router = APIRouter()
init_cloudinary()


def _provider_to_dict(provider: Optional[Any]) -> Dict[str, Any]:
    if provider is None:
        return {}
    if isinstance(provider, dict):
        return provider
    if hasattr(provider, "model_dump"):
        return provider.model_dump()
    return {}


def _resolve_palette(context: EventContext) -> List[str]:
    meta = context.metadata or {}
    palette = meta.get("palette")
    if isinstance(palette, list) and palette:
        return [str(color) for color in palette[:4]]
    return ["#5B99C2", "#F9DBBA", "#1A4870"]


def _calculate_budget_percentages(context: EventContext) -> Dict[str, float]:
    concept = context.selectedConcept or {}
    costs = concept.get("costs") or []
    total = concept.get("total_lkr") or context.total_budget_lkr or 1
    percents: Dict[str, float] = {"venue": 0.0, "music": 0.0}
    if total <= 0:
        total = 1
    for item in costs:
        category = item.get("category") if isinstance(item, dict) else None
        amount = float(item.get("amount_lkr", 0)) if isinstance(item, dict) else 0.0
        if category in ("venue", "music") and amount > 0:
            percents[category] = min(100.0, (amount / total) * 100.0)
    return percents


def _resolve_mood(context: EventContext) -> str:
    meta = context.metadata or {}
    vibe = str(meta.get("vibe" or "")).lower() if meta else ""
    vibe_map = {
        "luxury": "lush",
        "premium": "lush",
        "retro": "retro",
        "minimal": "minimal",
        "professional": "minimal",
        "energetic": "neon",
    }
    if vibe in vibe_map:
        return vibe_map[vibe]

    percents = _calculate_budget_percentages(context)
    if percents.get("venue", 0) >= 45:
        return "lush"
    if percents.get("music", 0) >= 40:
        return "neon"
    return "minimal"


def _build_artists_from_context(context: EventContext) -> List[Artist]:
    artists: List[Artist] = []
    selections = context.selections
    music_providers: List[Dict[str, any]] = []
    if selections and getattr(selections, "music", None):
        for provider in selections.music:
            music_providers.append(_provider_to_dict(provider))

    if not music_providers:
        # Create a placeholder so downstream harmonization still has a subject
        fallback_name = context.event_name or "Featured Artist"
        avatar_url = (
            f"https://ui-avatars.com/api/?name={fallback_name.replace(' ', '+')}&size=600&"
            "background=1A4870&color=F9DBBA&bold=true&format=png"
        )
        artists.append(Artist(id="artist-0", name=fallback_name, cutout_url=avatar_url))
        return artists

    for idx, provider in enumerate(music_providers[:5]):
        name = provider.get("name") or provider.get("bandName") or provider.get("companyName") or f"Artist {idx + 1}"
        base_url = provider.get("cutout_url") or provider.get("cutoutUrl")
        photo_url = (
            base_url
            or provider.get("photo")
            or provider.get("profilePhoto")
            or provider.get("image")
        )
        if not photo_url:
            photo_url = (
                f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&size=600&"
                "background=1A4870&color=F9DBBA&bold=true&format=png"
            )
        artists.append(Artist(id=str(provider.get("id") or provider.get("_id") or f"artist-{idx}"), name=name, cutout_url=photo_url))
    return artists


def _build_style_prefs_from_context(context: EventContext) -> StylePrefs:
    return StylePrefs(
        mood=_resolve_mood(context),
        palette=_resolve_palette(context),
        sizes=["square"],
    )


def _build_design_request_from_context(context: EventContext) -> StartDesignRequest:
    artists = _build_artists_from_context(context)
    genre = infer_genre_from_musicians([artist.model_dump() for artist in artists])
    city = extract_city(context.venue)
    event = Event(
        title=context.event_name,
        city=city,
        date=context.event_date,
        audience="general",
        genre=genre,
    )
    style_prefs = _build_style_prefs_from_context(context)
    return StartDesignRequest(
        campaign_id=context.campaign_id,
        event=event,
        artists=artists,
        style_prefs=style_prefs,
    )


def _event_context_payload_for_prompts(context: EventContext, style_prefs: StylePrefs, genre: Optional[str]) -> Dict[str, Any]:
    payload = context.model_dump()
    payload.update(
        {
            "palette": style_prefs.palette,
            "mood": style_prefs.mood,
            "genre": genre,
        }
    )
    if context.selections:
        payload["selections"] = _provider_to_dict(context.selections)
    return payload


def _default_cutout_layout(count: int, size: str) -> List[Tuple[int, int, int, int]]:
    canvas = _canvas_for(size)
    width = 400 if size == "square" else 360
    height = 600 if size == "square" else 540
    start_x = 150
    start_y = int(canvas["h"] * 0.45)
    step_x = int(width * 0.75)
    step_y = int(height * 0.7)
    layout: List[Tuple[int, int, int, int]] = []
    x, y = start_x, start_y
    for _ in range(count):
        layout.append((x, y, width, height))
        x += step_x
        if x + width > canvas["w"] - 150:
            x = start_x
            y += step_y
    return layout


def _fetch_image_bytes(url: str) -> Optional[bytes]:
    if not url:
        return None
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; EventPlannerAI/1.0)",
    }
    try:
        response = requests.get(url, timeout=60, headers=headers)
        if response.status_code == 200:
            return response.content
    except requests.exceptions.RequestException as exc:
        print(f"Warn: failed to fetch image {url}: {exc}")
    return None


def _collect_cutouts(image_urls: List[str], size: str) -> List[Tuple[bytes, Tuple[int, int, int, int]]]:
    usable_urls = [url for url in image_urls if url]
    layout = _default_cutout_layout(len(usable_urls), size)
    cutouts: List[Tuple[bytes, Tuple[int, int, int, int]]] = []
    for url, bbox in zip(usable_urls, layout):
        data = _fetch_image_bytes(url)
        if data:
            cutouts.append((data, bbox))
    return cutouts

def _canvas_for(size: str):
    return {"w": 2048, "h": 2048} if size == "square" else {"w": 1080, "h": 1920}

@router.post("/start", response_model=StartDesignResponse)
def start_design(payload: StartDesignRequest):
    render_id = str(uuid4())
    campaign_id = payload.campaign_id
    sizes = payload.style_prefs.sizes or ["square"]
    palette = payload.style_prefs.palette or ["#222222", "#555555"]

    # Save context for later use in harmonization
    style_prefs = payload.style_prefs or StylePrefs()
    design_context.save_context(render_id, campaign_id, payload.event, style_prefs, payload.artists)

    variants: list[Variant] = []
    stored_backgrounds: List[Dict[str, Any]] = []
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
        stored_backgrounds.append(
            BackgroundOption(
                image_url=bg_url,
                prompt=bg_prompt,
                model=bg_model,
                size=sz,
            ).model_dump()
        )

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

    if stored_backgrounds:
        design_context.store_backgrounds(render_id, stored_backgrounds)

    return StartDesignResponse(render_id=render_id, campaign_id=campaign_id, variants=variants)


@router.post("/generate-backgrounds", response_model=BackgroundGenerationResponse)
def generate_backgrounds(payload: BackgroundGenerationRequest):
    context = event_contexts.get(payload.campaign_id)
    if not context:
        raise HTTPException(404, "Event context not found for this campaign. Save planning data first.")

    design_request = _build_design_request_from_context(context)
    style_prefs = design_request.style_prefs or StylePrefs()

    render_id = str(uuid4())
    design_context.save_context(render_id, payload.campaign_id, design_request.event, style_prefs, design_request.artists)

    available_sizes = style_prefs.sizes or ["square"]
    target_size = payload.size if payload.size in available_sizes else available_sizes[0]
    count = min(max(payload.count, 1), 8)

    prompt_payload = _event_context_payload_for_prompts(context, style_prefs, design_request.event.genre)
    base_prompt = build_event_aware_bg_prompt(prompt_payload)
    prompt = base_prompt if not payload.user_query else f"{base_prompt} {payload.user_query}".strip()

    options: List[BackgroundOption] = []
    for idx in range(count):
        seed = random.randint(0, 2**31 - 1)
        bg_bytes = generate_background(prompt, target_size, seed=seed)
        background_url = upload_image_bytes(
            bg_bytes,
            public_id(payload.campaign_id, render_id, f"bg_{target_size}_{idx + 1}"),
        )
        option = BackgroundOption(
            image_url=background_url,
            prompt=prompt,
            model="FLUX.1-dev" if AI_ENABLE_FLUX else "gradient_fallback",
            seed=seed,
            size=target_size,
            metadata={
                "index": idx,
                "campaign_id": payload.campaign_id,
            },
        )
        options.append(option)

    if options:
        design_context.store_backgrounds(render_id, [opt.model_dump() for opt in options])

    return BackgroundGenerationResponse(
        campaign_id=payload.campaign_id,
        render_id=render_id,
        bg_options=options,
        prompt=prompt,
    )

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

@router.post("/upload")
def upload_image(payload: dict):
    """Upload a base64-encoded image to Cloudinary.
    Expects: {"image": "data:image/png;base64,iVBOR...", "campaign_id": "...", "name": "..."}
    Returns: {"url": "https://...", "public_id": "..."}
    """
    image_data = payload.get("image", "")
    campaign_id = payload.get("campaign_id", "temp")
    name = payload.get("name", "upload")
    
    if not image_data.startswith("data:image/"):
        raise HTTPException(422, "Invalid image format. Expected base64 data URL.")
    
    # Extract base64 content
    try:
        header, data = image_data.split(",", 1)
        img_bytes = base64.b64decode(data)
        
        # Validate it's a real image
        img = Image.open(io.BytesIO(img_bytes))
        
        # Re-encode as PNG for consistency
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        png_bytes = buf.getvalue()
        
        # Upload to Cloudinary
        render_id = str(uuid4())[:8]
        public_id_str = public_id(campaign_id, render_id, name)
        url = upload_image_bytes(png_bytes, public_id_str, "png")
        
        return {
            "url": url,
            "public_id": public_id_str,
            "size": len(png_bytes),
            "dimensions": f"{img.width}x{img.height}"
        }
        
    except Exception as e:
        raise HTTPException(422, f"Failed to process image: {str(e)}")

def _handle_advanced_harmonize(request: HarmonizeRequest) -> Dict[str, Any]:
    if not request.bg_url:
        raise HTTPException(422, "bg_url is required. Run the background step first or supply a direct URL.")
    if "REPLACE_WITH" in request.bg_url or not re.match(r"^https?://", request.bg_url):
        raise HTTPException(422, "bg_url looks invalid. Provide a full http(s) URL from the background generation step.")

    bg_bytes = _fetch_image_bytes(request.bg_url)
    if not bg_bytes:
        raise HTTPException(422, "Failed to download background image for harmonization.")

    cutouts_data: List[Tuple[bytes, Tuple[int, int, int, int]]] = []
    for sc in sorted(request.selected_cutouts, key=lambda c: c.z):
        if not sc.visible:
            continue
        data = _fetch_image_bytes(sc.url)
        if data:
            cutouts_data.append((data, sc.bbox))

    context = {"city": None, "mood": "neon", "genre": None, "palette": ["#9D00FF", "#00FFD1"]}
    try:
        context = design_context.extract_prompt_context(request.render_id)
    except Exception as exc:
        print(f"Context loading failed: {exc}, using default prompt")

    harm_prompt = build_harmonize_prompt(
        city=context.get("city"),
        mood=context.get("mood"),
        genre=context.get("genre"),
        palette=context.get("palette"),
    )

    comp_bytes = harmonize_img2img(
        bg_bytes=bg_bytes,
        cutouts=cutouts_data,
        prompt=harm_prompt,
        strength=0.55,
        seed=request.seed_harmonize,
        mood=context.get("mood", "neon"),
    )

    url = upload_image_bytes(
        comp_bytes,
        public_id(request.campaign_id or "demo", request.render_id, f"harmonized_{request.size}"),
    )

    base_response = HarmonizeResponse(
        render_id=request.render_id,
        size=request.size,
        l2_composite_url=url,
        meta={"model_harmonize": "FLUX.1-Kontext-dev", "seed_harmonize": str(request.seed_harmonize or "none")},
    )
    enriched = base_response.model_dump()
    enriched["harmonized_images"] = [
        HarmonizedImage(
            image_url=url,
            model="FLUX.1-Kontext-dev" if AI_ENABLE_FLUX else "composite",
            prompt=harm_prompt,
            seed=request.seed_harmonize,
        ).model_dump()
    ]
    return enriched


def _handle_simple_harmonize(request: SimpleHarmonizeRequest) -> Dict[str, Any]:
    render_id = request.render_id or design_context.get_render_id_for_campaign(request.campaign_id)
    if not render_id:
        raise HTTPException(404, "No render found for this campaign. Generate backgrounds before harmonizing.")

    backgrounds = design_context.get_backgrounds(render_id)
    if not backgrounds:
        raise HTTPException(422, "No stored backgrounds for this campaign. Generate backgrounds first.")
    if request.bg_choice_idx >= len(backgrounds):
        raise HTTPException(422, "Background index is out of range for stored options.")

    bg_option = backgrounds[request.bg_choice_idx]
    bg_url = bg_option.get("image_url")
    if not bg_url:
        raise HTTPException(422, "Selected background is missing an image URL.")

    bg_bytes = _fetch_image_bytes(bg_url)
    if not bg_bytes:
        raise HTTPException(422, "Failed to download selected background image.")

    size = bg_option.get("size", "square")
    context = design_context.extract_prompt_context(render_id)
    harm_prompt = build_harmonize_prompt(
        city=context.get("city"),
        mood=context.get("mood"),
        genre=context.get("genre"),
        palette=context.get("palette"),
    )

    cutout_urls = request.musician_image_urls
    if not cutout_urls:
        stored_artists = design_context.get_artists(render_id)
        cutout_urls = [artist.get("cutout_url") for artist in stored_artists if artist.get("cutout_url")]

    cutouts_data = _collect_cutouts(cutout_urls, size)

    comp_bytes = harmonize_img2img(
        bg_bytes=bg_bytes,
        cutouts=cutouts_data,
        prompt=harm_prompt,
        mood=context.get("mood", "neon"),
    )

    output_url = upload_image_bytes(
        comp_bytes,
        public_id(request.campaign_id or "demo", render_id, f"harmonized_{size}_{request.bg_choice_idx}"),
    )

    response = SimpleHarmonizeResponse(
        campaign_id=request.campaign_id,
        render_id=render_id,
        size=size,
        l2_composite_url=output_url,
        meta={
            "model_harmonize": "FLUX.1-Kontext-dev" if AI_ENABLE_FLUX else "composite",
            "background_index": request.bg_choice_idx,
        },
        harmonized_images=[
            HarmonizedImage(
                image_url=output_url,
                background_id=bg_option.get("id"),
                model="FLUX.1-Kontext-dev" if AI_ENABLE_FLUX else "composite",
                prompt=harm_prompt,
            )
        ],
    )
    return response.model_dump()


@router.post("/harmonize")
def harmonize(payload: Dict[str, Any]):
    if "selected_cutouts" in payload:
        request = HarmonizeRequest(**payload)
        return _handle_advanced_harmonize(request)

    simple_request = SimpleHarmonizeRequest(**payload)
    return _handle_simple_harmonize(simple_request)

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

@router.post("/start-from-event")
async def start_design_from_event_context(event_context: EventContext):
    """
    Generate poster designs using stored event planning context
    Automatically retrieves event data and maps to AI payload
    """
    try:
        design_request = _build_design_request_from_context(event_context)
        return start_design(design_request)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed to generate from event context: {str(e)}")
