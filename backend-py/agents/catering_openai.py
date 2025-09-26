# backend-py/agents/catering_openai.py
import os, csv, math, json
from typing import List, Dict, Optional
try:
    from openai import OpenAI
    _client = OpenAI() if os.getenv("OPENAI_API_KEY") else None
    _OPENAI_AVAILABLE = True
except ImportError:
    _client = None
    _OPENAI_AVAILABLE = False

_ROOT = os.path.dirname(os.path.dirname(__file__))
_VENUES_CSV = os.path.join(_ROOT, "data", "venues.csv")
_CATERERS_CSV = os.path.join(_ROOT, "data", "caterers.csv")

def _read_csv(path: str) -> List[Dict]:
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def _bool(s: Optional[str]) -> bool:
    return str(s or "").strip().lower() in ("1","true","yes","y")

def load_inhouse_for_venue(venue_name: Optional[str]) -> Optional[Dict]:
    if not venue_name:
        return None
    rows = _read_csv(_VENUES_CSV)
    vname = venue_name.strip().lower()
    for r in rows:
        if (r.get("name") or "").strip().lower() == vname:
            has = _bool(r.get("has_inhouse_catering"))
            pp = int(r.get("catering_pp_lkr") or 0)
            if has and pp > 0:
                return {
                    "name": r.get("name"),
                    "website": r.get("website"),
                    "pp_lkr": pp,
                    "source": "venues_csv"
                }
    return None

def load_city_caterers(city: str, want_stalls: bool) -> List[Dict]:
    rows = _read_csv(_CATERERS_CSV)
    out = []
    for r in rows:
        if (r.get("city") or "").strip().lower() != city.strip().lower():
            continue
        stall_ok = _bool(r.get("stall_ok"))
        if want_stalls and not stall_ok:
            continue
        try:
            out.append({
                "name": r.get("name"),
                "type": r.get("type"),
                "pp_min_lkr": int(r.get("pp_min_lkr") or 0),
                "pp_max_lkr": int(r.get("pp_max_lkr") or 0),
                "address": r.get("address"),
                "capacity_range": r.get("capacity_range"),
                "contact": r.get("contact"),
                "website": r.get("website"),
                "stall_ok": stall_ok,
                "rating": float(r.get("rating") or 0.0),
                "source": "caterers_csv"
            })
        except:
            continue
    out.sort(key=lambda x: (-x.get("rating", 0), x.get("pp_min_lkr", 0)))
    return out

def _default_concert_stall_plan(attendees: int) -> Dict:
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
    want_stalls = event_type.lower() == "concert"

    inhouse = load_inhouse_for_venue(venue)
    options = load_city_caterers(city, want_stalls)
    stall_plan = _default_concert_stall_plan(attendees) if want_stalls else None

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
        "You are a catering planner. Use only the facts provided to propose practical catering ideas. "
        "If in-house catering exists, prefer it when affordable. "
        "For concerts, propose food stalls with a sensible mix and an estimated per-person spend. "
        "Keep currency in LKR, do not invent prices beyond given ranges."
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
            "notes": ["Model output could not be parsed; returning raw options."]
        }

    for k in ("inhouse","external_options","stall_plan","notes"):
        data.setdefault(k, None if k != "external_options" else [])
    return data
