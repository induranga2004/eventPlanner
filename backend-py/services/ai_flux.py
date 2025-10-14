import os, io
from typing import List, Tuple, Optional
from PIL import Image, ImageDraw, ImageFilter
from huggingface_hub import InferenceClient
from config.ai_config import AIConfig
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
        negative_prompt = AIConfig.get_negative_prompt()
        
        out = _client.text_to_image(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,  # Add negative prompt
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

def _advanced_rasterize(bg: Image.Image, cutouts: List[Tuple[Image.Image, Tuple[int,int,int,int]]], mood: str = "neon") -> Image.Image:
    """Advanced rasterization with intelligent lighting and shadows"""
    canvas = bg.convert("RGBA").copy()
    
    # Mood-specific shadow and lighting parameters
    shadow_configs = {
        "neon": {"blur": 25, "dx": 0, "dy": 8, "alpha": 0.6, "color": (138, 43, 226)},  # Purple shadow
        "retro": {"blur": 15, "dx": -3, "dy": 6, "alpha": 0.4, "color": (139, 69, 19)},  # Brown shadow
        "minimal": {"blur": 10, "dx": 2, "dy": 4, "alpha": 0.3, "color": (64, 64, 64)},   # Gray shadow
        "lush": {"blur": 20, "dx": -2, "dy": 6, "alpha": 0.5, "color": (25, 25, 112)}     # Navy shadow
    }
    
    shadow_config = shadow_configs.get(mood, shadow_configs["neon"])
    
    # Sort by z-order (lower z renders first, appears behind)
    sorted_cutouts = sorted(enumerate(cutouts), key=lambda x: x[0])
    
    for z_idx, (cut, (x, y, w, h)) in sorted_cutouts:
        cut_resized = cut.convert("RGBA").resize((w, h), Image.Resampling.LANCZOS)
        
        # Create advanced shadow
        alpha_channel = cut_resized.split()[-1]
        
        # Multi-layer shadow for depth
        shadow_large = Image.new("RGBA", (w+100, h+100), (0,0,0,0))
        shadow_med = Image.new("RGBA", (w+60, h+60), (0,0,0,0))
        
        # Large blur shadow (background)
        shadow_mask_large = alpha_channel.point(lambda p: int(shadow_config["alpha"] * 80))
        shadow_color_large = Image.new("RGBA", (w, h), shadow_config["color"] + (int(shadow_config["alpha"] * 80),))
        shadow_large.paste(shadow_color_large, (50, 50), shadow_mask_large)
        shadow_large = shadow_large.filter(ImageFilter.GaussianBlur(shadow_config["blur"]))
        
        # Medium blur shadow (detail)
        shadow_mask_med = alpha_channel.point(lambda p: int(shadow_config["alpha"] * 120))
        shadow_color_med = Image.new("RGBA", (w, h), shadow_config["color"] + (int(shadow_config["alpha"] * 120),))
        shadow_med.paste(shadow_color_med, (30, 30), shadow_mask_med)
        shadow_med = shadow_med.filter(ImageFilter.GaussianBlur(shadow_config["blur"] // 2))
        
        # Composite shadows
        canvas.alpha_composite(shadow_large, (x + shadow_config["dx"] - 50, y + shadow_config["dy"] - 50))
        canvas.alpha_composite(shadow_med, (x + shadow_config["dx"] - 30, y + shadow_config["dy"] - 30))
        
        # Add subtle rim lighting for depth
        if mood == "neon":
            rim_light = cut_resized.copy()
            rim_mask = alpha_channel.point(lambda p: min(p, 60))
            rim_color = Image.new("RGBA", (w, h), (0, 255, 200, 60))  # Cyan rim light
            rim_light = Image.alpha_composite(Image.new("RGBA", (w, h), (0,0,0,0)), 
                                           Image.composite(rim_color, Image.new("RGBA", (w, h), (0,0,0,0)), rim_mask))
            canvas.alpha_composite(rim_light, (x-1, y-1))
        
        # Finally, paste the cutout
        canvas.alpha_composite(cut_resized, (x, y))
    
    return canvas

# -------- public API --------
def harmonize_img2img(
    bg_bytes: bytes,
    cutouts: List[Tuple[bytes, Tuple[int,int,int,int]]],
    prompt: str,
    strength: float = 0.45,  # Reduced for more preservation
    seed: Optional[int] = None,
    guidance_scale: float = 4.0,  # Slightly higher for better prompt adherence
    num_inference_steps: int = 28,  # More steps for better quality
    mood: str = "neon"  # Add mood parameter for advanced processing
) -> bytes:
    """Merge L1+L2 via FLUX.1-Kontext-dev (i2i). Falls back to non-AI composite if disabled."""
    bg = Image.open(io.BytesIO(bg_bytes)).convert("RGBA")
    cut_pils = [(Image.open(io.BytesIO(b)).convert("RGBA"), bbox) for b,bbox in cutouts]
    init = _advanced_rasterize(bg, cut_pils, mood)

    if not (_client and AI_ENABLE_FLUX):
        return _to_png_bytes(init)

    try:
        # Get configuration parameters
        harm_params = AIConfig.get_harmonization_params()
        enhanced_prompt = AIConfig.enhance_prompt(prompt)
        negative_prompt = AIConfig.get_negative_prompt()
        
        # Enhanced parameters for better accuracy and quality
        out = _client.image_to_image(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,  # Add negative prompt
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
