# backend-py/agents/venue_finder.py
import json
import os
from typing import Dict, List, Optional

from crewai import Agent, Task, Crew, Process
from crewai.llm import LLM

# OpenAI integration for venue intelligence
_OPENAI_AVAILABLE = False
try:
    import openai
    _OPENAI_AVAILABLE = True
except Exception:
    _OPENAI_AVAILABLE = False

from utils.provider_repository import list_venues

MUSICAL_KEYWORDS = {
    "musical",
    "concert",
    "arena",
    "auditorium",
    "theatre",
    "theater",
    "festival",
    "hall",
    "amphitheatre",
    "performance",
}


def _matches_event_type(venue: Dict, event_type: Optional[str]) -> bool:
    evt = (event_type or "").strip().lower()
    if not evt:
        return True
    venue_type = (venue.get("type") or "").lower()
    if not venue_type:
        return True
    if evt == "musical":
        return any(keyword in venue_type for keyword in MUSICAL_KEYWORDS)
    return evt in venue_type or venue_type in evt

def _mongo_base_search(city: str, event_type: str, top_k: int) -> List[Dict]:
    candidates = list_venues(city=city, limit=max(top_k * 3, 24))
    if not candidates:
        return []
    filtered = [venue for venue in candidates if _matches_event_type(venue, event_type)]
    if not filtered:
        filtered = candidates
    # Order by rating, then capacity similar to CSV fallback.
    filtered.sort(key=lambda r: (r.get("rating", 0.0) or 0.0, r.get("capacity", 0) or 0), reverse=True)
    return filtered[: top_k * 2]


def openai_venue_search(city: str, event_type: str, base_venues: List[Dict], top_k: int = 7) -> List[Dict]:
    """Use OpenAI to enhance venue recommendations from Mongo-backed data."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not (_OPENAI_AVAILABLE and api_key):
        return []

    if not base_venues:
        return []

    try:
        client = openai.OpenAI(api_key=api_key)
        
        # Create prompt for venue analysis and enhancement
        prompt = f"""
You are an expert event planner specializing in {event_type} events in {city}. 
Analyze these venues and enhance the recommendations:

VENUES DATA:
{json.dumps(base_venues, indent=2)}

TASK:
1. Rank these venues for a {event_type} in {city}
2. Add intelligent insights about each venue's suitability
3. Estimate missing capacity if not provided (based on venue type and name)
4. Provide booking difficulty assessment (1-10 scale)
5. Return top {top_k} venues with enhanced information

RETURN FORMAT (valid JSON only):
[
  {{
    "name": "venue name",
    "address": "venue address", 
    "type": "venue type",
    "capacity": estimated_capacity_number,
    "avg_cost_lkr": cost_in_lkr,
    "rating": rating_0_to_5,
    "website": "website_url",
    "min_lead_days": days_number,
    "source": "openai_enhanced",
    "ai_insights": "why this venue is good for {event_type}",
    "booking_difficulty": difficulty_1_to_10,
    "suitability_score": score_0_to_100
  }}
]
"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert event venue consultant. Always return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Parse AI response
        ai_response = response.choices[0].message.content.strip()
        
        # Clean response to ensure it's valid JSON
        if ai_response.startswith("```json"):
            ai_response = ai_response[7:]
        if ai_response.endswith("```"):
            ai_response = ai_response[:-3]
        
        venues = json.loads(ai_response)
        
        # Ensure we return the requested number
        return venues[:top_k]
        
    except Exception as e:
        print(f"OpenAI venue search error: {e}")
    return base_venues[:top_k]

def crewai_venue_analysis(city: str, event_type: str, venues_data: List[Dict], top_k: int = 7) -> List[Dict]:
    """Use CrewAI with OpenAI to analyze and rank venues"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return venues_data[:top_k]
    
    try:
        # Configure CrewAI to use OpenAI
        llm = LLM(
            model="gpt-3.5-turbo",
            api_key=api_key
        )
        
        venue_analyst = Agent(
            role="Venue Selection Expert",
            goal=f"Analyze and rank venues for {event_type} events in {city}",
            backstory=(
                f"You are a seasoned event planner with 15+ years of experience organizing {event_type} events in {city}. "
                "You have deep knowledge of venue logistics, pricing, and guest experience factors."
            ),
            llm=llm,
            verbose=False,
            allow_delegation=False
        )

        analysis_task = Task(
            agent=venue_analyst,
            description=(
                f"Analyze these venues for a {event_type} in {city}:\n\n"
                f"{json.dumps(venues_data, indent=2)}\n\n"
                f"Rank the top {top_k} venues and enhance each with:\n"
                "1. Suitability score (0-100) for this event type\n"
                "2. Booking difficulty assessment (1-10)\n"
                "3. Professional insights about logistics and guest experience\n"
                "4. Estimated missing information (capacity, costs if not provided)\n\n"
                "Return ONLY a valid JSON array with enhanced venue objects."
            ),
            expected_output=f"JSON array of top {top_k} venues with enhanced analysis"
        )

        crew = Crew(
            agents=[venue_analyst],
            tasks=[analysis_task],
            process=Process.sequential,
            verbose=False
        )

        result = crew.kickoff()
        
        # Parse the result
        result_str = str(result)
        if result_str.startswith("```json"):
            result_str = result_str[7:]
        if result_str.endswith("```"):
            result_str = result_str[:-3]
        
        enhanced_venues = json.loads(result_str)
        return enhanced_venues[:top_k]
        
    except Exception as e:
        print(f"CrewAI venue analysis error: {e}")
        return venues_data[:top_k]

def find_venues(city: str, event_type: str, top_k: int = 7) -> List[Dict]:
    """Find venues using OpenAI-enhanced recommendations backed by Mongo data."""
    base_venues = _mongo_base_search(city, event_type, top_k=top_k)

    if not base_venues:
        return []
    
    # Try OpenAI direct search first (faster)
    openai_results = openai_venue_search(city, event_type, base_venues, top_k=top_k)
    if openai_results:
        return openai_results
    
    # Try CrewAI analysis as fallback
    crewai_results = crewai_venue_analysis(city, event_type, base_venues, top_k=top_k)
    if crewai_results:
        return crewai_results
    
    # Final fallback is the raw Mongo-derived list
    return base_venues[:top_k]
