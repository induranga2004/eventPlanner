import json
import logging
from openai import OpenAI
from config.config import OPENAI_API_KEY, DEMO_MODE

logger = logging.getLogger(__name__)
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def _deterministic_captions(event):
    name = event.get("name", "Your Event")
    date = event.get("date", "soon")
    venue = event.get("venue", "our venue")
    return {
        "instagram": f"🎉 {name} on {date} at {venue}! Grab your tickets now! #Event #{name.replace(' ', '')}",
        "facebook": f"Join us for {name} on {date} at {venue}. Don't miss out!",
        "linkedin": f"Excited to announce {name} happening on {date} at {venue}.",
        "twitter": f"{name} on {date} at {venue}!",
    }


def generate_captions(event):
    # Demo mode: never call OpenAI
    if DEMO_MODE:
        return _deterministic_captions(event)

    # No API key: gracefully fall back instead of raising
    if not client:
        logger.warning("OPENAI_API_KEY missing; using deterministic captions fallback")
        return _deterministic_captions(event)

    prompt = f"""
    Generate social media captions for this event:

    Event: {event['name']}
    Date: {event['date']}
    Venue: {event['venue']}
    Ticket Price: {event['price']}
    Audience: {event['audience']}

    Rules:
    - Instagram: emojis + hashtags
    - Facebook: storytelling
    - LinkedIn: professional
    - Twitter: max 240 chars
    Return JSON.
    """
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        try:
            return json.loads(resp.choices[0].message.content)
        except Exception:
            return {"instagram": resp.choices[0].message.content}
    except Exception as e:
        # Handle 429 billing_not_active and any other OpenAI errors by falling back
        logger.error("OpenAI caption generation failed; falling back. Error: %s", getattr(e, "message", str(e)))
        return _deterministic_captions(event)
