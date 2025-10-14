"""
Context management for design generation
Helps maintain event context across API calls for better AI accuracy
"""
import json
import requests
from typing import Optional, Dict, Any, List
from models.design import Event, StylePrefs, Artist

class DesignContext:
    """Manages context for design generation to improve AI accuracy"""
    
    def __init__(self):
        self.context_cache: Dict[str, Dict[str, Any]] = {}
        self.campaign_render_map: Dict[str, str] = {}
        self.background_cache: Dict[str, List[Dict[str, Any]]] = {}
        self.artist_cache: Dict[str, List[Dict[str, Any]]] = {}
    
    def save_context(
        self,
        render_id: str,
        campaign_id: str,
        event: Event,
        style_prefs: StylePrefs,
        artists: Optional[List[Artist]] = None,
    ):
        """Save event context for later use"""
        self.context_cache[render_id] = {
            "campaign_id": campaign_id,
            "event": event.model_dump(),
            "style_prefs": style_prefs.model_dump(),
        }
        self.campaign_render_map[campaign_id] = render_id
        if artists is not None:
            self.artist_cache[render_id] = [artist.model_dump() for artist in artists]
    
    def get_context(self, render_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve saved context for render_id"""
        return self.context_cache.get(render_id)

    def get_render_id_for_campaign(self, campaign_id: str) -> Optional[str]:
        """Lookup the most recent render id for a campaign"""
        return self.campaign_render_map.get(campaign_id)

    def store_backgrounds(self, render_id: str, backgrounds: List[Dict[str, Any]]):
        """Persist generated background options for a render"""
        self.background_cache[render_id] = backgrounds

    def get_backgrounds(self, render_id: str) -> List[Dict[str, Any]]:
        """Retrieve generated backgrounds for a render"""
        return self.background_cache.get(render_id, [])

    def get_artists(self, render_id: str) -> List[Dict[str, Any]]:
        """Retrieve artist metadata tied to a render"""
        return self.artist_cache.get(render_id, [])
    
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