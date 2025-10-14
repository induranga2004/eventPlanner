"""
AI Configuration for fine-tuning accuracy and quality
Adjust these parameters to improve results
"""
import os
from typing import Dict, Any

class AIConfig:
    """Configuration for AI model parameters and prompts"""
    
    # FLUX.1-dev (Background generation) parameters
    BG_GENERATION = {
        "guidance_scale": float(os.getenv("BG_GUIDANCE_SCALE", "3.5")),
        "num_inference_steps": int(os.getenv("BG_INFERENCE_STEPS", "28")),
        "width": int(os.getenv("BG_WIDTH", "2048")),
        "height": int(os.getenv("BG_HEIGHT", "2048")),
    }
    
    # FLUX.1-Kontext-dev (Harmonization) parameters
    HARMONIZATION = {
        "strength": float(os.getenv("HARM_STRENGTH", "0.45")),  # Lower = more preservation
        "guidance_scale": float(os.getenv("HARM_GUIDANCE_SCALE", "4.0")),
        "num_inference_steps": int(os.getenv("HARM_INFERENCE_STEPS", "28")),
    }
    
    # Prompt enhancement settings
    PROMPT_CONFIG = {
        "use_enhanced_prompts": os.getenv("USE_ENHANCED_PROMPTS", "true").lower() == "true",
        "include_technical_terms": os.getenv("INCLUDE_TECHNICAL_TERMS", "true").lower() == "true",
        "add_quality_modifiers": os.getenv("ADD_QUALITY_MODIFIERS", "true").lower() == "true",
    }
    
    # Quality modifiers for prompts
    QUALITY_MODIFIERS = [
        "professional photography quality",
        "high resolution",
        "sharp details", 
        "vibrant colors",
        "cinematic composition",
        "perfect lighting"
    ]
    
    # Negative prompt elements (things to avoid)
    NEGATIVE_PROMPTS = [
        "blurry",
        "low quality", 
        "distorted faces",
        "extra limbs",
        "text",
        "watermarks",
        "logos"
    ]
    
    @classmethod
    def get_bg_params(cls) -> Dict[str, Any]:
        """Get background generation parameters"""
        return cls.BG_GENERATION.copy()
    
    @classmethod 
    def get_harmonization_params(cls) -> Dict[str, Any]:
        """Get harmonization parameters"""
        return cls.HARMONIZATION.copy()
    
    @classmethod
    def enhance_prompt(cls, base_prompt: str) -> str:
        """Enhance prompt with quality modifiers if enabled"""
        if not cls.PROMPT_CONFIG["use_enhanced_prompts"]:
            return base_prompt
        
        enhanced = base_prompt
        
        if cls.PROMPT_CONFIG["add_quality_modifiers"]:
            quality_terms = ", ".join(cls.QUALITY_MODIFIERS[:3])  # Use top 3
            enhanced += f" {quality_terms}."
        
        return enhanced
    
    @classmethod
    def get_negative_prompt(cls) -> str:
        """Get negative prompt string"""
        return ", ".join(cls.NEGATIVE_PROMPTS)

# Environment-specific configurations
ACCURACY_PRESETS = {
    "development": {
        "bg_inference_steps": 20,  # Faster for dev
        "harm_inference_steps": 20,
        "harm_strength": 0.5
    },
    "production": {
        "bg_inference_steps": 35,  # Higher quality for production
        "harm_inference_steps": 35,
        "harm_strength": 0.4
    },
    "high_quality": {
        "bg_inference_steps": 50,  # Maximum quality
        "harm_inference_steps": 50, 
        "harm_strength": 0.35
    }
}

def get_preset(preset_name: str = None) -> Dict[str, Any]:
    """Get configuration preset"""
    preset_name = preset_name or os.getenv("ACCURACY_PRESET", "development")
    return ACCURACY_PRESETS.get(preset_name, ACCURACY_PRESETS["development"])