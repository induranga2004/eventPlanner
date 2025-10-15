import json
import logging
from openai import OpenAI
from config.config import OPENAI_API_KEY, DEMO_MODE

logger = logging.getLogger(__name__)
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def _deterministic_captions(event):
    """Generate beautiful captions with emojis and simple English."""
    name = event.get("name", "Event")
    date = event.get("date", "")
    venue = event.get("venue", "")
    price = event.get("price", "")
    
    # Beautiful format with emojis and simple English
    caption_parts = []
    
    # Event name with celebration emoji
    if name:
        caption_parts.append(f"🎉 {name}")
    
    # Date with calendar emoji
    if date:
        caption_parts.append(f"📅 {date}")
    
    # Venue with location emoji
    if venue:
        caption_parts.append(f"📍 {venue}")
    
    # Price with ticket emoji
    if price:
        caption_parts.append(f"🎫 {price}")
    
    # Join with newlines for readability
    caption = "\n".join(caption_parts)
    
    # Add a call-to-action at the end
    if caption:
        caption += "\n\n✨ Don't miss out!"
    
    # Ensure it's under Mastodon's 500 char limit
    if len(caption) > 400:
        # Remove call-to-action if too long
        caption = "\n".join(caption_parts)
    
    if len(caption) > 450:
        # Truncate if still too long
        caption = caption[:450]
    
    return {
        "instagram": caption,
        "facebook": caption,
        "linkedin": caption,
        "twitter": caption[:280],
        "mastodon": caption,
    }


def generate_captions(event):
    """Generate simple captions without AI - always use deterministic version."""
    # ALWAYS use simple captions (no AI)
    return _deterministic_captions(event)
