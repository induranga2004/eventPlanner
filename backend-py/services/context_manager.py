"""
Context management for design generation
Helps maintain event context across API calls for better AI accuracy
"""
import json
import requests
from typing import Optional, Dict, Any
from models.design import Event, StylePrefs

class DesignContext:
    """Manages context for design generation to improve AI accuracy"""
    
    def __init__(self):
        self.context_cache: Dict[str, Dict[str, Any]] = {}
    
    def save_context(self, render_id: str, event: Event, style_prefs: StylePrefs):
        """Save event context for later use"""
        self.context_cache[render_id] = {
            "event": event.model_dump(),
            "style_prefs": style_prefs.model_dump()
        }
    
    def get_context(self, render_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve saved context for render_id"""
        return self.context_cache.get(render_id)
    
    def extract_prompt_context(self, render_id: str) -> Dict[str, Any]:
        """Extract context suitable for prompt building"""
        context = self.get_context(render_id)
        if not context:
            return {
                "city": None,
                "mood": "neon",
                "genre": None,
                "palette": ["#9D00FF", "#00FFD1"]
            }
        
        event_data = context.get("event", {})
        style_data = context.get("style_prefs", {})
        
        return {
            "city": event_data.get("city"),
            "mood": style_data.get("mood", "neon"),
            "genre": event_data.get("genre"),
            "palette": style_data.get("palette", ["#9D00FF", "#00FFD1"])
        }

# Global context manager instance
design_context = DesignContext()