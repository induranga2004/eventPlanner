from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import Response
import re
import base64
import io
from uuid import uuid4
import random
import logging
from typing import Any, Dict, List, Optional
import requests
from PIL import Image
from sqlalchemy.orm import Session

from models.design import (
    BackgroundGenerationRequest,
    BackgroundGenerationResponse,
    BackgroundOption,
    Artist,
    StylePrefs,
    Event,
)
from models.event_context import EventContext, EventContextRecord
from config.database import get_db
from services.cloudinary_store import init_cloudinary, upload_image_bytes, public_id
from services.ai_flux import AI_ENABLE_FLUX, gradient_background, generate_background
from services.context_manager import design_context
from services.event_aware_prompts import (
    build_event_aware_bg_prompt,
    infer_genre_from_musicians,
    extract_city,
)
from services.poster_prompts import suggest_background_prompt
from services.postback_service import postback_service
from models.postback import PostBackCreate
from prompts.design_prompts import build_bg_prompt

router = APIRouter()
init_cloudinary()

logger = logging.getLogger(__name__)


def _save_to_postback(
    campaign_id: str,
    render_id: str,
    cloudinary_url: str,
    size: str = "square",
    prompt: Optional[str] = None,
    model: Optional[str] = None,
    seed: Optional[int] = None,
    event_name: Optional[str] = None,
    event_date: Optional[str] = None,
    mood: Optional[str] = None,
    palette: Optional[List[str]] = None,
    artists: Optional[List[str]] = None,
    metadata: Optional[Dict[str, Any]] = None,
):
    """Helper to save generated background image data to MongoDB postback collection"""
    try:
        postback_data = PostBackCreate(
            campaign_id=campaign_id,
            render_id=render_id,
            cloudinary_url=cloudinary_url,
            size=size,
            prompt=prompt,
            model=model,
            seed=seed,
            event_name=event_name,
            event_date=event_date,
            mood=mood,
            palette=palette,
            artists=artists,
            metadata=metadata,
        )
        result = postback_service.save_postback(postback_data)
        if result["success"]:
            logger.info(f"Saved background to postback collection: {result['mongo_id']}")
        else:
            logger.warning(f"Failed to save to postback: {result['message']}")
        return result
    except Exception as e:
        logger.error(f"Error saving to postback: {e}", exc_info=True)
        return {"success": False, "message": str(e)}


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
            if isinstance(provider, dict):
                music_providers.append(provider)
            elif hasattr(provider, "model_dump"):
                music_providers.append(provider.model_dump())

    if not music_providers:
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
        artists.append(Artist(
            id=str(provider.get("id") or provider.get("_id") or f"artist-{idx}"),
            name=name,
            cutout_url=photo_url
        ))
    return artists


def _build_style_prefs_from_context(context: EventContext) -> StylePrefs:
    return StylePrefs(
        mood=_resolve_mood(context),
        palette=_resolve_palette(context),
        sizes=["square"],
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
        if isinstance(context.selections, dict):
            payload["selections"] = context.selections
        elif hasattr(context.selections, "model_dump"):
            payload["selections"] = context.selections.model_dump()
    return payload


@router.post("/generate-backgrounds", response_model=BackgroundGenerationResponse)
def generate_backgrounds(
    payload: BackgroundGenerationRequest,
    db: Session = Depends(get_db),
):
    """
    Generate AI backgrounds for poster design.
    These backgrounds are sent to the frontend editor for manual composition.
    Users will manually add artists, text, and other elements in the editor.
    """
    record = (
        db.query(EventContextRecord)
        .filter(EventContextRecord.campaign_id == payload.campaign_id)
        .one_or_none()
    )
    if not record or not record.data:
        raise HTTPException(404, "Event context not found for this campaign. Save planning data first.")

    context = EventContext(**record.data)

    # Build style preferences from context
    style_prefs = _build_style_prefs_from_context(context)
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

    render_id = str(uuid4())
    design_context.save_context(render_id, payload.campaign_id, event, style_prefs, artists)

    available_sizes = style_prefs.sizes or ["square"]
    target_size = payload.size if payload.size in available_sizes else available_sizes[0]
    count = min(max(payload.count, 1), 8)

    # Generate prompt
    prompt_payload = _event_context_payload_for_prompts(context, style_prefs, genre)
    base_prompt = build_event_aware_bg_prompt(prompt_payload)
    prompt_suggestion = suggest_background_prompt(
        event_payload=prompt_payload,
        base_prompt=base_prompt,
        user_query=payload.user_query,
    )
    prompt = prompt_suggestion.prompt
    prompt_source = prompt_suggestion.source

    # Hardcoded fallback images for quick testing/demo
    FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=2048&h=2048&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=2048&h=2048&fit=crop",
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=2048&h=2048&fit=crop",
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=2048&h=2048&fit=crop",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=2048&h=2048&fit=crop",
    ]

    options: List[BackgroundOption] = []
    for idx in range(count):
        seed = random.randint(0, 2**31 - 1)
        
        # FORCED: Always use hardcoded images for now (remove try/except to force it)
        background_url = FALLBACK_IMAGES[idx % len(FALLBACK_IMAGES)]
        model_used = "fallback_unsplash"
        
        option = BackgroundOption(
            image_url=background_url,
            prompt=prompt,
            model=model_used,
            seed=seed,
            size=target_size,
            metadata={
                "index": idx,
                "campaign_id": payload.campaign_id,
                "prompt_source": prompt_source,
                "hardcoded": True,
            },
        )
        options.append(option)
        
        # Save each background to MongoDB postback collection
        artist_names = [artist.name for artist in artists] if artists else None
        _save_to_postback(
            campaign_id=payload.campaign_id,
            render_id=render_id,
            cloudinary_url=background_url,
            size=target_size,
            prompt=prompt,
            model=model_used,
            seed=seed,
            event_name=context.event_name,
            event_date=context.event_date,
            mood=style_prefs.mood,
            palette=style_prefs.palette,
            artists=artist_names,
            metadata={
                "index": idx,
                "prompt_source": prompt_source,
                "generation_type": "background",
                "for_manual_editing": True  # Flag indicating this goes to frontend editor
            }
        )

    if options:
        design_context.store_backgrounds(render_id, [opt.model_dump() for opt in options])

    return BackgroundGenerationResponse(
        campaign_id=payload.campaign_id,
        render_id=render_id,
        bg_options=options,
        prompt=prompt,
    )


@router.post("/upload")
def upload_image(payload: dict):
    """
    Upload a base64-encoded image to Cloudinary.
    Used for manual uploads or editor exports.
    
    Expects: {"image": "data:image/png;base64,iVBOR...", "campaign_id": "...", "name": "..."}
    Returns: {"url": "https://...", "public_id": "..."}
    """
    image_data = payload.get("image", "")
    campaign_id = payload.get("campaign_id", "temp")
    name = payload.get("name", "upload")
    
    if not image_data.startswith("data:image/"):
        raise HTTPException(422, "Invalid image format. Expected base64 data URL.")
    
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
        
        # Save uploaded image to MongoDB postback
        _save_to_postback(
            campaign_id=campaign_id,
            render_id=render_id,
            cloudinary_url=url,
            size=f"{img.width}x{img.height}",
            metadata={
                "generation_type": "manual_upload",
                "original_name": name,
                "file_size": len(png_bytes)
            }
        )
        
        return {
            "url": url,
            "public_id": public_id_str,
            "size": len(png_bytes),
            "dimensions": f"{img.width}x{img.height}"
        }
        
    except Exception as e:
        raise HTTPException(422, f"Failed to process image: {str(e)}")


@router.get("/postbacks/{campaign_id}")
def get_campaign_postbacks(campaign_id: str):
    """
    Retrieve all generated backgrounds for a campaign from MongoDB.
    Returns history of all AI-generated backgrounds for this campaign.
    """
    try:
        postbacks = postback_service.get_postbacks_by_campaign(campaign_id)
        return {
            "campaign_id": campaign_id,
            "count": len(postbacks),
            "postbacks": postbacks
        }
    except Exception as e:
        logger.error(f"Error retrieving postbacks: {e}", exc_info=True)
        raise HTTPException(500, f"Failed to retrieve postbacks: {str(e)}")


@router.get("/postback/render/{render_id}")
def get_postback_by_render(render_id: str):
    """
    Retrieve a specific background by render_id from MongoDB.
    """
    try:
        postback = postback_service.get_postback_by_render_id(render_id)
        if not postback:
            raise HTTPException(404, f"No postback found for render_id: {render_id}")
        return postback
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving postback: {e}", exc_info=True)
        raise HTTPException(500, f"Failed to retrieve postback: {str(e)}")


@router.post("/start-from-event")
def start_design_from_event_context(payload: dict, db: Session = Depends(get_db)):
    """
    Generate backgrounds from event context - returns hardcoded images immediately
    """
    try:
        campaign_id = payload.get("campaign_id", str(uuid4())[:8])
        
        # Hardcoded fallback images for instant response
        FALLBACK_IMAGES = [
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=2048&h=2048&fit=crop",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=2048&h=2048&fit=crop",
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=2048&h=2048&fit=crop",
        ]
        
        render_id = str(uuid4())[:8]
        
        # Return 3 background options immediately
        bg_options = []
        for idx, img_url in enumerate(FALLBACK_IMAGES):
            bg_options.append({
                "image_url": img_url,
                "prompt": "Event background",
                "model": "hardcoded_unsplash",
                "seed": idx,
                "size": "square",
                "metadata": {
                    "index": idx,
                    "campaign_id": campaign_id,
                }
            })
        
        return {
            "campaign_id": campaign_id,
            "render_id": render_id,
            "bg_options": bg_options,
            "prompt": "Hardcoded event backgrounds"
        }
        
    except Exception as e:
        logger.error(f"Error in start-from-event: {e}", exc_info=True)
        raise HTTPException(500, f"Failed: {str(e)}")


@router.post("/harmonize")
def harmonize(payload: dict):
    """
    SIMPLIFIED: Just return the generated backgrounds directly for manual editing.
    No AI harmonization - user edits manually in frontend.
    """
    try:
        # Return hardcoded images immediately for editor
        campaign_id = payload.get("campaign_id", "demo")
        render_id = payload.get("render_id", str(uuid4())[:8])
        
        FALLBACK_IMAGES = [
            "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=2048&h=2048&fit=crop",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=2048&h=2048&fit=crop",
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=2048&h=2048&fit=crop",
        ]
        
        # Pick one random image
        selected_bg = FALLBACK_IMAGES[random.randint(0, len(FALLBACK_IMAGES)-1)]
        
        return {
            "render_id": render_id,
            "campaign_id": campaign_id,
            "size": "square",
            "l2_composite_url": selected_bg,
            "harmonized_images": [
                {
                    "image_url": selected_bg,
                    "model": "manual_editing_placeholder",
                    "prompt": "Use this background for manual editing"
                }
            ],
            "meta": {
                "for_manual_editing": True,
                "message": "Edit this manually in the frontend editor"
            }
        }
    except Exception as e:
        logger.error(f"Harmonize placeholder error: {e}")
        raise HTTPException(500, str(e))
