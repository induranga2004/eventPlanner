# backend-py/routers/concept_names.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
import os
from openai import OpenAI, APIError

from dependencies.api_key import require_planner_api_key

router = APIRouter(
    prefix="/planner",
    tags=["concept-names"],
    dependencies=[Depends(require_planner_api_key)],
)
logger = logging.getLogger(__name__)

class ConceptNameRequest(BaseModel):
    vibe: Optional[str] = "high-energy musical night"
    city: Optional[str] = "Colombo"
    audience: Optional[str] = "live music fans"
    budget_lkr: Optional[int] = 1_000_000
    attendees: Optional[int] = 150

class ConceptNameResponse(BaseModel):
    title: str
    tagline: str

def _get_openai_client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured")
    return OpenAI(api_key=api_key)

@router.post("/regenerate-name", response_model=ConceptNameResponse)
def regenerate_concept_name(body: ConceptNameRequest):
    """Generate a fresh, creative event concept name using OpenAI."""
    
    client = _get_openai_client()
    
    prompt = f"""Generate a unique, catchy event concept name for a musical experience.

Context:
- Location: {body.city}
- Vibe: {body.vibe}
- Audience: {body.audience}
- Budget: LKR {body.budget_lkr:,} for {body.attendees} attendees
- Style: Modern, energetic live music showcase

Return JSON with:
- title: 4-6 words, memorable and exciting (e.g., "Electric Nights Rooftop Sessions")
- tagline: 8-12 words, punchy descriptor (e.g., "Where city lights meet live beats under the stars")

Make it creative, unique, and suited to the vibe. No generic titles like "Music Festival" or "Live Concert"."""

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_CONCEPT_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": "You are a creative event naming expert. Always reply with JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=100,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        return ConceptNameResponse(
            title=result.get("title", "Vibrant Live Experience"),
            tagline=result.get("tagline", "Unforgettable musical journey")
        )
    
    except APIError as exc:
        logger.error(f"OpenAI API error: {exc}")
        if "insufficient_quota" in str(exc).lower():
            # Fallback when quota exhausted
            return ConceptNameResponse(
                title=f"{body.city} Live Showcase",
                tagline="Local talent meets world-class production"
            )
        raise HTTPException(status_code=503, detail="Name generation temporarily unavailable")
    except Exception as exc:
        logger.error(f"Unexpected error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
