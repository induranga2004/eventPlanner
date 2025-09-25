from fastapi import APIRouter, HTTPException
from uuid import uuid4
import requests

from models.design import (
    StartDesignRequest, StartDesignResponse, Variant, TextOverlay, TextItem, Bounds, CutoutAsset,
    HarmonizeRequest, HarmonizeResponse
)
from services.cloudinary_store import init_cloudinary, upload_image_bytes, public_id, save_manifest
from services.ai_flux import gradient_background, harmonize_img2img
from prompts.design_prompts import build_harmonize_prompt

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

    variants: list[Variant] = []
    for sz in sizes:
        # L1 background (gradient fallback for MVP)
        bg_bytes = gradient_background(sz, palette)
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
                "seed_bg": "gradient",
                "model_bg": "gradient_fallback",
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

    # Build harmonize prompt (you can enrich with city/mood later by reading saved manifest)
    harm_prompt = build_harmonize_prompt(city=None, mood=None)

    comp_bytes = harmonize_img2img(
        bg_bytes=bg_bytes,
        cutouts=cutouts_data,
        prompt=harm_prompt,
        strength=0.55,
        seed=payload.seed_harmonize
    )

    url = upload_image_bytes(comp_bytes, public_id(payload.campaign_id or "demo", payload.render_id, f"harmonized_{payload.size}"))

    return HarmonizeResponse(
        render_id=payload.render_id,
        size=payload.size,
        l2_composite_url=url,
        meta={"model_harmonize": "FLUX.1-Kontext-dev", "seed_harmonize": str(payload.seed_harmonize or "none")}
    )
