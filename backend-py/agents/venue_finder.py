# backend-py/agents/venue_finder.py
import os
import csv
from typing import List, Dict

from crewai import Agent, Task, Crew, Process

# Optional SerpAPI tool (live search). Falls back to CSV if not configured.
_SERP_AVAILABLE = False
try:
    from crewai_tools import SerpApiSearchTool  # pip install crewai-tools
    _SERP_AVAILABLE = True
except Exception:
    _SERP_AVAILABLE = False


def _csv_path() -> str:
    return os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "venues.csv"
    )

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
            # loose type match
            if (event_type.lower() in t) or (t in event_type.lower()) or (event_type.lower() == "wedding"):
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

def serp_search(city: str, event_type: str, top_k: int = 7) -> List[Dict]:
    api_key = os.getenv("SERPAPI_API_KEY") or os.getenv("SERPAPI_KEY")
    if not (_SERP_AVAILABLE and api_key):
        return []

    tool = SerpApiSearchTool(api_key=api_key)
    query = f"best {event_type} venues in {city}"

    researcher = Agent(
        role="Venue Researcher",
        goal=f"Find top venues for {event_type} in {city}",
        backstory="Expert at scanning web results and extracting structured venue info.",
        tools=[tool],
        verbose=True,
        allow_delegation=False
    )

    task = Task(
        agent=researcher,
        description=(
            f"Use the web search tool to find 5-7 good venues for {event_type} in {city}. "
            "Include name, address, type/category, rating (if any), and website link if present. "
            "Return them as a JSON array with keys: name, address, type, rating, website."
        ),
        expected_output="A JSON array of venue objects"
    )

    crew = Crew(agents=[researcher], tasks=[task], process=Process.sequential, verbose=True)
    raw = crew.kickoff(inputs={"query": query})

    try:
        import json
        data = json.loads(str(raw))
        return [{
            "name": it.get("name"),
            "address": it.get("address"),
            "type": it.get("type"),
            "capacity": None,
            "avg_cost_lkr": None,
            "rating": it.get("rating"),
            "website": it.get("website"),
            "min_lead_days": None,
            "source": "serpapi"
        } for it in data][:top_k]
    except Exception:
        return []

def find_venues(city: str, event_type: str, top_k: int = 7) -> List[Dict]:
    serp = serp_search(city, event_type, top_k=top_k)
    if serp:
        return serp
    return csv_fallback_search(city, event_type, top_k=top_k)
