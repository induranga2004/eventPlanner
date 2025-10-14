from typing import List

def build_bg_prompt(title: str, city: str, genre: str|None, mood: str, palette: List[str]) -> str:
    """Enhanced background generation prompt for better context and composition"""
    
    # Genre-specific background elements
    genre_elements = {
        "electronic": "Futuristic cityscape with neon lights, digital patterns, and cyberpunk aesthetics",
        "rock": "Industrial concert venue with dramatic spotlights, smoke, and metal textures", 
        "pop": "Vibrant stage setting with colorful lights, confetti, and energetic atmosphere",
        "hip-hop": "Urban street scene with graffiti, city lights, and modern architecture",
        "jazz": "Intimate club atmosphere with warm lighting, vintage elements, and sophisticated ambiance",
        "classical": "Grand concert hall with elegant architecture, soft lighting, and refined details"
    }
    
    # Mood-specific lighting and atmosphere
    mood_atmosphere = {
        "neon": "Electric neon lighting with vibrant colors, high contrast, and futuristic glow",
        "retro": "Vintage film aesthetic with warm tones, subtle grain, and nostalgic atmosphere", 
        "minimal": "Clean, modern composition with soft lighting and geometric elements",
        "lush": "Rich, saturated colors with dramatic lighting and luxurious textures"
    }
    
    base_genre = genre or "electronic"
    genre_desc = genre_elements.get(base_genre, genre_elements["electronic"])
    mood_desc = mood_atmosphere.get(mood, mood_atmosphere["neon"])
    
    # Color palette integration
    palette_desc = f"Color palette featuring {', '.join(palette[:3])}" if palette else "Dynamic color palette"
    
    return (
        f"Professional concert poster background for {title} in {city}. "
        f"{genre_desc}. {mood_desc}. {palette_desc}. "
        f"High contrast areas perfect for text overlay. Cinematic depth and composition. "
        f"Professional photography quality. No text, no logos, no people. "
        f"Leave clear focal areas for artist placement. Dramatic perspective and lighting."
    )

def build_harmonize_prompt(city: str|None, mood: str|None, genre: str|None = None, palette: list[str]|None = None) -> str:
    """Build enhanced harmonization prompt with more context for better AI accuracy"""
    
    # Base harmonization requirements
    base_prompt = (
        "Professional concert poster composition. Seamlessly integrate artist cutouts with background. "
        "Match lighting direction and color temperature precisely. Add realistic drop shadows and ambient lighting. "
        "Preserve all facial features and clothing details. No text, logos, or watermarks. "
    )
    
    # Mood-specific lighting instructions
    mood_lighting = {
        "neon": "Vibrant neon lighting with electric blues, magentas, and cyans. High contrast shadows with colored rim lighting.",
        "retro": "Warm vintage lighting with golden hour tones. Soft film grain texture. Subtle vignette effect.",
        "minimal": "Clean, soft lighting with subtle shadows. Modern aesthetic with balanced exposure.",
        "lush": "Rich, saturated colors with dramatic lighting. Deep shadows and warm highlights."
    }
    
    # Genre-specific atmosphere
    genre_atmosphere = {
        "electronic": "Futuristic atmosphere with digital glitch effects and laser-like lighting",
        "rock": "High-energy atmosphere with dramatic spotlighting and smoke effects",
        "pop": "Bright, colorful atmosphere with even lighting and polished aesthetics",
        "hip-hop": "Urban atmosphere with street-style lighting and bold contrasts",
        "jazz": "Moody atmosphere with warm, intimate lighting and subtle shadows",
        "classical": "Elegant atmosphere with sophisticated lighting and refined tones"
    }
    
    # Build contextual prompt
    mood_context = mood_lighting.get(mood or "neon", mood_lighting["neon"])
    genre_context = genre_atmosphere.get(genre or "electronic", "dynamic concert atmosphere")
    
    # Color palette guidance
    palette_guidance = ""
    if palette and len(palette) >= 2:
        palette_guidance = f" Enhance colors to match palette: {', '.join(palette)}."
    
    # City-specific context
    city_context = f" Capture the energy of {city}" if city else " Urban nightlife energy"
    
    return (
        base_prompt + mood_context + " " + genre_context + "." + 
        city_context + "." + palette_guidance + 
        " Maintain photorealistic quality with cinematic composition."
    )
