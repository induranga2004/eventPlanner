# backend-py/routers/venues.py
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from agents.venue_finder import find_venues

router = APIRouter(prefix="/venues", tags=["venues"])

class VenueOut(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[int] = None
    avg_cost_lkr: Optional[int] = None
    rating: Optional[float] = None
    website: Optional[str] = None
    min_lead_days: Optional[int] = None
    source: Optional[str] = None

@router.get("/suggest", response_model=List[VenueOut], summary="Suggest venues for a city & event type")
def suggest_venues(
    city: str = Query(..., description="City name, e.g., Colombo"),
    event_type: str = Query(..., description="wedding|concert|corporate|workshop|birthday"),
    top_k: int = Query(7, ge=1, le=12)
):
    return find_venues(city=city, event_type=event_type, top_k=top_k)
