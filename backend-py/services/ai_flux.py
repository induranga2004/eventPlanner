import os, io
from typing import List, Tuple, Optional
from PIL import Image, ImageDraw, ImageFilter
from huggingface_hub import InferenceClient
from config.ai_config import AIConfig, get_preset

AI_ENABLE_FLUX = os.getenv("AI_ENABLE_FLUX", "false").lower() == "true"
_HF_TOKEN = os.environ.get("HF_TOKEN")

_client: Optional[InferenceClient] = None
if AI_ENABLE_FLUX and _HF_TOKEN:
    _client = InferenceClient(provider="auto", api_key=_HF_TOKEN)

# -------- helpers --------
def _to_png_bytes(pil: Image.Image) -> bytes:
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    return buf.getvalue()

def _gradient(size, palette: list[str]) -> Image.Image:
    w, h = size
    img = Image.new("RGB", (w, h), palette[0] if palette else "#111")
    if palette and len(palette) > 1:
        top = tuple(int(palette[0][i:i+2], 16) for i in (1,3,5))
        bot = tuple(int(palette[1][i:i+2], 16) for i in (1,3,5))
        draw = ImageDraw.Draw(img)
        for y in range(h):
            t = y/(h-1)
            r = int((1-t)*top[0] + t*bot[0])
            g = int((1-t)*top[1] + t*bot[1])
            b = int((1-t)*top[2] + t*bot[2])
            draw.line([(0,y),(w,y)], fill=(r,g,b))
    return img

def generate_background(prompt: str, size_name: str, seed: Optional[int] = None) -> bytes:
    """Generate AI background using FLUX.1-dev with configurable parameters"""
    size = (2048, 2048) if size_name == "square" else (1080, 1920)
    
    if not (_client and AI_ENABLE_FLUX):
        # Fallback to gradient
        return gradient_background(size_name, ["#222222", "#555555"])
    
    try:
        # Get configuration parameters
        bg_params = AIConfig.get_bg_params()
        enhanced_prompt = AIConfig.enhance_prompt(prompt)
        
        out = _client.text_to_image(
            prompt=enhanced_prompt,
            model="black-forest-labs/FLUX.1-dev",
            width=size[0],
            height=size[1],
            guidance_scale=bg_params["guidance_scale"],
            num_inference_steps=bg_params["num_inference_steps"],
            seed=seed
        )
        return _to_png_bytes(out)
    except Exception as e:
        print(f"Background generation failed: {e}, using gradient fallback")
        return gradient_background(size_name, ["#222222", "#555555"])

def gradient_background(size_name: str, palette: list[str]) -> bytes:
    size = (2048, 2048) if size_name == "square" else (1080, 1920)
    return _to_png_bytes(_gradient(size, palette))

def _rasterize(bg: Image.Image, cutouts: List[Tuple[Image.Image, Tuple[int,int,int,int]]]) -> Image.Image:
    canvas = bg.convert("RGBA").copy()
    # sort by z implicitly by order from caller; if needed, sort here
    for cut, (x,y,w,h) in cutouts:
        cut = cut.convert("RGBA").resize((w,h))
        # soft shadow using alpha
        alpha = cut.split()[-1]
        shadow = Image.new("RGBA", (w+120, h+120), (0,0,0,0))
        m = alpha.point(lambda p: 100)
        m = Image.merge("RGBA", (m,m,m,m)).filter(ImageFilter.GaussianBlur(30))
        canvas.alpha_composite(m, (x-60, y-40))
        canvas.alpha_composite(cut, (x, y))
    return canvas

# -------- public API --------
def harmonize_img2img(
    bg_bytes: bytes,
    cutouts: List[Tuple[bytes, Tuple[int,int,int,int]]],
    prompt: str,
    strength: float = 0.45,  # Reduced for more preservation
    seed: Optional[int] = None,
    guidance_scale: float = 4.0,  # Slightly higher for better prompt adherence
    num_inference_steps: int = 28  # More steps for better quality
) -> bytes:
    """Merge L1+L2 via FLUX.1-Kontext-dev (i2i). Falls back to non-AI composite if disabled."""
    bg = Image.open(io.BytesIO(bg_bytes)).convert("RGBA")
    cut_pils = [(Image.open(io.BytesIO(b)).convert("RGBA"), bbox) for b,bbox in cutouts]
    init = _rasterize(bg, cut_pils)

    if not (_client and AI_ENABLE_FLUX):
        return _to_png_bytes(init)

    try:
        # Get configuration parameters
        harm_params = AIConfig.get_harmonization_params()
        enhanced_prompt = AIConfig.enhance_prompt(prompt)
        
        # Enhanced parameters for better accuracy and quality
        out = _client.image_to_image(
            prompt=enhanced_prompt,
            image=init,  # PIL.Image
            model="black-forest-labs/FLUX.1-Kontext-dev",
            strength=harm_params["strength"],
            guidance_scale=harm_params["guidance_scale"],
            num_inference_steps=harm_params["num_inference_steps"],
            seed=seed
        )
        if out.size != init.size:
            out = out.resize(init.size, Image.Resampling.LANCZOS)  # Better resampling
        return _to_png_bytes(out)
    except Exception as e:
        print(f"AI harmonization failed: {e}, falling back to composite")
        return _to_png_bytes(init)  # Fallback to non-AI composite
