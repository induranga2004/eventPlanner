# backend-py/routers/catering.py
from fastapi import APIRouter, Query
from typing import Optional
from agents.catering_openai import suggest_catering_with_openai

router = APIRouter(prefix="/catering", tags=["catering"])

@router.get("/suggest", summary="Suggest catering options for an event (OpenAI-powered)")
def suggest_catering(
    city: str = Query(..., description="City, e.g., Colombo"),
    event_type: str = Query(..., description="wedding|concert|corporate|workshop|birthday"),
    venue: Optional[str] = Query(None, description="Venue name if known"),
    attendees: int = Query(100, ge=1),
    total_budget_lkr: Optional[int] = Query(None),
):
    return suggest_catering_with_openai(
        city=city,
        event_type=event_type,
        venue=venue,
        attendees=attendees,
        total_budget_lkr=total_budget_lkr
    )
