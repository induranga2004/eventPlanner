# backend-py/agents/catering_openai.py
import json
import math
import os
from typing import Any, Dict, List, Optional

from utils.provider_repository import find_venue_by_name, list_caterers

try:
    from openai import OpenAI

    _client = OpenAI() if os.getenv("OPENAI_API_KEY") else None
    _OPENAI_AVAILABLE = True
except ImportError:
    _client = None
    _OPENAI_AVAILABLE = False


def _first(doc: Dict[str, Any], keys: List[str]) -> Optional[Any]:
    for key in keys:
        value = doc.get(key)
        if value not in (None, "", []):
            return value
    return None


def _to_bool(value: Any) -> Optional[bool]:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"1", "true", "yes", "y", "on"}:
            return True
        if normalized in {"0", "false", "no", "n", "off"}:
            return False
    return None


def _to_int(value: Any) -> Optional[int]:
    if value in (None, ""):
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        digits = [part for part in value.replace(",", " ").split() if part.isdigit()]
        if digits:
            return int(digits[0])
    return None


def load_inhouse_for_venue(venue_name: Optional[str]) -> Optional[Dict[str, Any]]:
    if not venue_name:
        return None

    doc = find_venue_by_name(venue_name)
    if not doc:
        return None

    has_inhouse = _to_bool(
        _first(
            doc,
            [
                "hasInhouseCatering",
                "inhouseCatering",
                "has_inhouse_catering",
                "inHouseCatering",
            ],
        )
    )
    per_person = _to_int(
        _first(
            doc,
            [
                "cateringPerPersonLkr",
                "catering_pp_lkr",
                "perPersonCostLkr",
                "perPersonLkr",
            ],
        )
    )

    if has_inhouse and per_person and per_person > 0:
        return {
            "name": _first(doc, ["venueName", "companyName", "name"]) or venue_name,
            "website": _first(
                doc,
                [
                    "website",
                    "facebookLink",
                    "instagramLink",
                    "youtubeLink",
                ],
            ),
            "pp_lkr": per_person,
            "source": "mongo_users",
        }

    return None


def load_city_caterers(city: str, want_stalls: bool) -> List[Dict[str, Any]]:
    caterers = list_caterers(city=city, limit=30)
    if want_stalls:
        filtered = [c for c in caterers if c.get("stall_ok")]
        if filtered:
            caterers = filtered

    caterers = [c for c in caterers if c.get("name")]
    caterers.sort(key=lambda x: (-x.get("rating", 0.0), x.get("pp_min_lkr", 0)))
    return caterers

def _default_performance_catering_plan(attendees: int) -> Dict:
    count = max(2, math.ceil(attendees / 180))
    categories = ["Savory/Grill", "Vegetarian", "Dessert", "Beverage", "Snack/Bites"]
    mix = [categories[i % len(categories)] for i in range(count)]
    return {
        "stall_count": count,
        "suggested_mix": mix,
        "per_person_spend_lkr_range": [1200, 1800]
    }

def suggest_catering_with_openai(
    city: str,
    event_type: str,
    venue: Optional[str],
    attendees: int,
    total_budget_lkr: Optional[int] = None
) -> Dict:
    normalized_type = (event_type or "").strip().lower()
    want_stalls = normalized_type in {"musical", "concert", "festival", "performance"}

    inhouse = load_inhouse_for_venue(venue)
    options = load_city_caterers(city, want_stalls)
    stall_plan = _default_performance_catering_plan(attendees) if want_stalls else None

    options_short = [
        {
            "name": o["name"],
            "type": o["type"],
            "pp_min_lkr": o["pp_min_lkr"],
            "pp_max_lkr": o["pp_max_lkr"],
            "website": o["website"],
            "stall_ok": o["stall_ok"],
            "source": o["source"],
            "rating": o["rating"],
        }
        for o in options[:8]
    ]

    system = (
        "You are a catering planner specialising in live musical events in Colombo. Use only the facts provided to propose practical catering ideas. "
        "If in-house catering exists, prefer it when affordable. "
        "For musical performances and festivals, suggest stall mixes with realistic per-person spend. "
        "Keep currency in LKR and stay within provided price ranges."
    )
    user = {
        "city": city,
        "event_type": event_type,
        "venue": venue,
        "attendees": attendees,
        "total_budget_lkr": total_budget_lkr,
        "facts": {
            "inhouse": inhouse,
            "external_options": options_short,
            "stall_plan_default": stall_plan
        },
        "constraints": {"max_options": 6}
    }

    # Try OpenAI if available and configured
    if _OPENAI_AVAILABLE and _client:
        try:
            resp = _client.chat.completions.create(
                model="gpt-3.5-turbo",
                response_format={"type":"json_object"},
                messages=[
                    {"role":"system","content":system},
                    {"role":"user","content":json.dumps(user)}
                ],
                temperature=0.3
            )
            data = json.loads(resp.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI catering suggestion error: {e}")
            data = None
    else:
        data = None
    
    # Fallback to basic structure if OpenAI failed or unavailable
    if not data:
        data = {
            "inhouse": inhouse,
            "external_options": options_short,
            "stall_plan": stall_plan,
            "notes": [
                "AI response unavailable; providing curated Colombo musical catering options."
            ]
        }

    for k in ("inhouse","external_options","stall_plan","notes"):
        data.setdefault(k, None if k != "external_options" else [])
    return data
