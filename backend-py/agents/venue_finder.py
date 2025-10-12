# backend-py/agents/venue_finder.py
import os
import csv
import json
from typing import List, Dict

from crewai import Agent, Task, Crew, Process
from crewai.llm import LLM

# OpenAI integration for venue intelligence
_OPENAI_AVAILABLE = False
try:
    import openai
    _OPENAI_AVAILABLE = True
except Exception:
    _OPENAI_AVAILABLE = False


def _csv_path() -> str:
    return os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "venues.csv"
    )

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


def csv_fallback_search(city: str, event_type: str, top_k: int = 7) -> List[Dict]:
    """
    data/venues.csv columns:
    city,name,type,address,capacity,avg_cost_lkr,rating,website,min_lead_days
    """
    path = _csv_path()
    results: List[Dict] = []
    if not os.path.exists(path):
        return results

    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("city", "").strip().lower() != city.strip().lower():
                continue
            t = (row.get("type", "") or "").lower()
            evt = (event_type or "").strip().lower()

            if evt == "musical":
                match = (not t) or any(keyword in t for keyword in MUSICAL_KEYWORDS)
            else:
                match = (evt in t) or (t in evt) or (evt == "wedding")

            if match:
                results.append({
                    "name": row.get("name"),
                    "address": row.get("address"),
                    "type": row.get("type"),
                    "capacity": int(row.get("capacity") or 0),
                    "avg_cost_lkr": int(row.get("avg_cost_lkr") or 0),
                    "rating": float(row.get("rating") or 0.0),
                    "website": row.get("website"),
                    "min_lead_days": int(row.get("min_lead_days") or 0),
                    "source": "csv"
                })

    results.sort(key=lambda r: (r.get("rating", 0), r.get("capacity", 0)), reverse=True)
    return results[:top_k]

def openai_venue_search(city: str, event_type: str, top_k: int = 7) -> List[Dict]:
    """Use OpenAI to enhance venue recommendations from CSV data"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not (_OPENAI_AVAILABLE and api_key):
        return []

    # Get base venues from CSV
    csv_venues = csv_fallback_search(city, event_type, top_k=20)  # Get more for AI to analyze
    if not csv_venues:
        return []

    try:
        client = openai.OpenAI(api_key=api_key)
        
        # Create prompt for venue analysis and enhancement
        prompt = f"""
You are an expert event planner specializing in {event_type} events in {city}. 
Analyze these venues and enhance the recommendations:

VENUES DATA:
{json.dumps(csv_venues, indent=2)}

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
        # Fallback to CSV data if OpenAI fails
        return csv_venues[:top_k]

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
    """Find venues using OpenAI-enhanced recommendations or CSV fallback"""
    # Get base venues from CSV
    csv_venues = csv_fallback_search(city, event_type, top_k=15)  # Get more for AI analysis
    
    if not csv_venues:
        return []
    
    # Try OpenAI direct search first (faster)
    openai_results = openai_venue_search(city, event_type, top_k=top_k)
    if openai_results:
        return openai_results
    
    # Try CrewAI analysis as fallback
    crewai_results = crewai_venue_analysis(city, event_type, csv_venues, top_k=top_k)
    if crewai_results:
        return crewai_results
    
    # Final fallback to basic CSV search
    return csv_venues[:top_k]
