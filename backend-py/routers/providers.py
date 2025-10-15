# backend-py/routers/providers.py
"""
Provider endpoints for fetching venue, music, lighting, and sound options from MongoDB.
Supports filtering by city, budget, and other criteria.
"""
import logging
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from dependencies.api_key import require_planner_api_key
from utils.provider_repository import (
    list_venues,
    list_solo_musicians,
    list_music_ensembles,
    list_lighting,
    list_sound_specialists
)

logger = logging.getLogger(__name__)
router = APIRouter(
    prefix="/planner/providers",
    tags=["providers"],
    dependencies=[Depends(require_planner_api_key)],
)

# ==================== Response Models ====================

class VenueProvider(BaseModel):
    """Venue provider from MongoDB users collection (role='venue')"""
    id: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    type: Optional[str] = None
    capacity: Optional[int] = None
    avg_cost_lkr: Optional[int] = None
    standard_rate_lkr: Optional[int] = None
    rating: Optional[float] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    min_lead_days: Optional[int] = None
    source: Optional[str] = "mongo_users"

class MusicianProvider(BaseModel):
    """Solo musician from MongoDB users collection (role='musician')"""
    id: Optional[str] = None
    name: Optional[str] = None
    genres: Optional[List[str]] = None
    experience: Optional[str] = None
    standard_rate_lkr: Optional[int] = None
    spotify: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    contact: Optional[str] = None
    source: Optional[str] = "mongo_users"
    provider_type: str = "solo"

class BandProvider(BaseModel):
    """Music band/ensemble from MongoDB users collection (role='music_band')"""
    id: Optional[str] = None
    name: Optional[str] = None
    genres: Optional[List[str]] = None
    members: Optional[int] = None
    experience: Optional[str] = None
    standard_rate_lkr: Optional[int] = None
    youtube: Optional[str] = None
    instagram: Optional[str] = None
    website: Optional[str] = None
    contact: Optional[str] = None
    source: Optional[str] = "mongo_users"
    provider_type: str = "band"

class LightingProvider(BaseModel):
    """Lighting designer from MongoDB users collection (role='lights')"""
    id: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    services: Optional[List[str]] = None
    crew_size: Optional[int] = None
    standard_rate_lkr: Optional[int] = None
    website: Optional[str] = None
    contact: Optional[str] = None
    source: Optional[str] = "mongo_users"

class SoundProvider(BaseModel):
    """Sound engineer from MongoDB users collection (role='sounds')"""
    id: Optional[str] = None
    name: Optional[str] = None
    services: Optional[List[str]] = None
    crew_size: Optional[int] = None
    standard_rate_lkr: Optional[int] = None
    website: Optional[str] = None
    contact: Optional[str] = None
    source: Optional[str] = "mongo_users"

# ==================== Endpoints ====================

@router.get("/venue", response_model=List[VenueProvider], summary="Get venue options")
def get_venues(
    city: Optional[str] = Query(None, description="Filter by city (e.g., 'Colombo', 'Hambantota')"),
    min_capacity: Optional[int] = Query(None, description="Minimum capacity required"),
    max_budget_lkr: Optional[int] = Query(None, description="Maximum budget in LKR"),
    limit: int = Query(12, ge=1, le=50, description="Maximum number of results")
):
    """
    Fetch venue providers from MongoDB users collection.
    
    If city filter returns no results, will return ALL venues (fallback behavior).
    
    Example MongoDB document structure:
    ```json
    {
        "role": "venue",
        "name": "Hambantota Marina Event Deck",
        "venueAddress": "Magampura Port Access Road, Hambantota",
        "capacity": 340,
        "standardRate": 75000,
        "phone": "+94 781234567"
    }
    ```
    """
    venues = list_venues(city=city, limit=limit)
    
    # Fallback: if city filter returns no results, try without city filter
    if city and len(venues) == 0:
        logger.warning(f"No venues found for city '{city}', fetching all venues as fallback")
        venues = list_venues(city=None, limit=limit)
    
    # Apply filters
    if min_capacity:
        venues = [v for v in venues if (v.get("capacity") or 0) >= min_capacity]
    
    if max_budget_lkr:
        venues = [
            v for v in venues 
            if (v.get("avg_cost_lkr") or v.get("standard_rate_lkr") or 0) <= max_budget_lkr
        ]
    
    return venues


@router.get("/music", response_model=List[dict], summary="Get music providers (musicians + bands)")
def get_music_providers(
    city: Optional[str] = Query(None, description="Filter by city"),
    genre: Optional[str] = Query(None, description="Filter by genre (e.g., 'Rock', 'Jazz')"),
    max_budget_lkr: Optional[int] = Query(None, description="Maximum budget in LKR"),
    limit: int = Query(12, ge=1, le=50, description="Maximum number of results")
):
    """
    Fetch music providers from MongoDB users collection.
    
    Returns BOTH solo musicians (role='musician') AND bands (role='music_band').
    Frontend can select MULTIPLE musicians for the event.
    
    Example MongoDB document structure:
    ```json
    // Solo musician
    {
        "role": "musician",
        "name": "John Doe",
        "genres": ["Rock", "Blues"],
        "experience": "10 years",
        "standardRate": 50000
    }
    
    // Band
    {
        "role": "music_band",
        "bandName": "The Jazz Collective",
        "genres": ["Jazz", "Fusion"],
        "members": 5,
        "standardRate": 150000
    }
    ```
    """
    # Fetch both types
    solo_musicians = list_solo_musicians(city=city, limit=limit)
    bands = list_music_ensembles(city=city, limit=limit)
    
    # Fallback: if city filter returns no results, try without city filter
    if city and len(solo_musicians) == 0 and len(bands) == 0:
        logger.warning(f"No music providers found for city '{city}', fetching all as fallback")
        solo_musicians = list_solo_musicians(city=None, limit=limit)
        bands = list_music_ensembles(city=None, limit=limit)
    
    # Combine and mark type
    all_music = []
    
    for musician in solo_musicians:
        musician["provider_type"] = "solo"
        all_music.append(musician)
    
    for band in bands:
        band["provider_type"] = "band"
        all_music.append(band)
    
    # Apply genre filter
    if genre:
        genre_lower = genre.lower()
        all_music = [
            m for m in all_music
            if m.get("genres") and any(
                genre_lower in (g or "").lower() 
                for g in (m.get("genres") if isinstance(m.get("genres"), list) else [m.get("genres")])
            )
        ]
    
    # Apply budget filter
    if max_budget_lkr:
        all_music = [
            m for m in all_music
            if (m.get("standard_rate_lkr") or 0) <= max_budget_lkr
        ]
    
    # Sort by rate (cheaper first) then by experience
    all_music.sort(
        key=lambda m: (
            m.get("standard_rate_lkr") or 999999,
            -(len(m.get("experience") or "") if isinstance(m.get("experience"), str) else 0)
        )
    )
    
    return all_music[:limit]


@router.get("/lighting", response_model=List[LightingProvider], summary="Get lighting designers")
def get_lighting_providers(
    city: Optional[str] = Query(None, description="Filter by city"),
    max_budget_lkr: Optional[int] = Query(None, description="Maximum budget in LKR"),
    min_crew_size: Optional[int] = Query(None, description="Minimum crew size"),
    limit: int = Query(12, ge=1, le=50, description="Maximum number of results")
):
    """
    Fetch lighting designers from MongoDB users collection.
    
    Example MongoDB document structure:
    ```json
    {
        "role": "lights",
        "name": "Studio X Lighting",
        "services": ["Stage Lighting", "LED Walls", "Special Effects"],
        "crewSize": 8,
        "standardRate": 45000
    }
    ```
    """
    providers = list_lighting(city=city, limit=limit)
    
    # Fallback: if city filter returns no results, try without city filter
    if city and len(providers) == 0:
        logger.warning(f"No lighting providers found for city '{city}', fetching all as fallback")
        providers = list_lighting(city=None, limit=limit)
    
    # Apply filters
    if max_budget_lkr:
        providers = [
            p for p in providers
            if (p.get("standard_rate_lkr") or 0) <= max_budget_lkr
        ]
    
    if min_crew_size:
        providers = [
            p for p in providers
            if (p.get("crew_size") or 0) >= min_crew_size
        ]
    
    # Sort by rate
    providers.sort(key=lambda p: p.get("standard_rate_lkr") or 999999)
    
    return providers


@router.get("/sound", response_model=List[SoundProvider], summary="Get sound engineers")
def get_sound_providers(
    city: Optional[str] = Query(None, description="Filter by city"),
    max_budget_lkr: Optional[int] = Query(None, description="Maximum budget in LKR"),
    min_crew_size: Optional[int] = Query(None, description="Minimum crew size"),
    limit: int = Query(12, ge=1, le=50, description="Maximum number of results")
):
    """
    Fetch sound engineers from MongoDB users collection.
    
    Example MongoDB document structure:
    ```json
    {
        "role": "sounds",
        "companyName": "ProSound Inc",
        "services": ["Live Sound", "Recording", "Equipment Rental"],
        "crewSize": 6,
        "standardRate": 60000
    }
    ```
    """
    providers = list_sound_specialists(city=city, limit=limit)
    
    # Fallback: if city filter returns no results, try without city filter
    if city and len(providers) == 0:
        logger.warning(f"No sound providers found for city '{city}', fetching all as fallback")
        providers = list_sound_specialists(city=None, limit=limit)
    
    # Apply filters
    if max_budget_lkr:
        providers = [
            p for p in providers
            if (p.get("standard_rate_lkr") or 0) <= max_budget_lkr
        ]
    
    if min_crew_size:
        providers = [
            p for p in providers
            if (p.get("crew_size") or 0) >= min_crew_size
        ]
    
    # Sort by rate
    providers.sort(key=lambda p: p.get("standard_rate_lkr") or 999999)
    
    return providers
