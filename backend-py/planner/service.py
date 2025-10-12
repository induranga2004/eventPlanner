# backend-py/planner/service.py
from typing import List, Tuple
from datetime import date as _date
from uuid import uuid4

CONCEPT_A_SPLIT = [
    ("venue",         0.40),
    ("catering",      0.25),
    ("decoration",    0.15),
    ("entertainment", 0.10),
    ("logistics",     0.05),
    ("marketing",     0.03),
    ("contingency",   0.02),
]

MILESTONES = [
    (-30, "Vendor shortlist & RFPs"),
    (-21, "Confirm venue & core vendors"),
    (-14, "Lock menu & décor plan"),
    (-7,  "Final run sheet + contact list"),
    (-1,  "Setup & checks"),
    (0,   "Event day"),
]

# Event-specific concept names
EVENT_CONCEPT_NAMES = {
    "wedding": {
        "A1": "Grand Wedding Luxury",
        "A2": "Garden Wedding Romance", 
        "A3": "Modern Wedding Chic",
        "A4": "Traditional Wedding Heritage"
    },
    "birthday": {
        "A1": "Birthday Celebration Deluxe",
        "A2": "Garden Birthday Party",
        "A3": "Modern Birthday Bash",
        "A4": "Traditional Birthday Gathering"
    },
    "concert": {
        "A1": "Premium Concert Experience", 
        "A2": "Outdoor Concert Festival",
        "A3": "Modern Concert Production",
        "A4": "Cultural Concert Showcase"
    },
    "corporate": {
        "A1": "Executive Corporate Event",
        "A2": "Garden Corporate Retreat", 
        "A3": "Modern Corporate Summit",
        "A4": "Traditional Corporate Gala"
    },
    "graduation": {
        "A1": "Luxury Graduation Ceremony",
        "A2": "Garden Graduation Celebration",
        "A3": "Modern Graduation Party",
        "A4": "Traditional Graduation Honor"
    },
    "workshop": {
        "A1": "Premium Workshop Experience",
        "A2": "Outdoor Workshop Retreat",
        "A3": "Modern Workshop Session",
        "A4": "Traditional Workshop Gathering"
    },
    "anniversary": {
        "A1": "Grand Anniversary Celebration",
        "A2": "Garden Anniversary Party",
        "A3": "Modern Anniversary Event",
        "A4": "Traditional Anniversary Gathering"
    },
    "conference": {
        "A1": "Executive Conference Summit",
        "A2": "Outdoor Conference Retreat",
        "A3": "Modern Conference Experience",
        "A4": "Traditional Conference Gathering"
    },
    "default": {
        "A1": "Grand Luxury Experience",
        "A2": "Garden Party Elegance", 
        "A3": "Modern Minimalist Chic",
        "A4": "Cultural Heritage Celebration"
    }
}

# Different concept themes with unique characteristics
CONCEPT_THEMES = {
    "A1": {
        "base_title": "Grand Luxury Experience",
        "venue_preference": "luxury_hotel",
        "catering_style": "premium_plated",
        "decorations": "Premium florals & crystal chandeliers",
        "entertainment": "Live band + professional MC",
        "service_level": "White-glove concierge service",
        "unique_features": ["Welcome cocktail hour", "Premium bar service", "Valet parking"],
        "target_per_person": 8000,
        "venue_weight": 0.45,
        "catering_weight": 0.30,
        "other_weights": {"decoration": 0.15, "entertainment": 0.07, "logistics": 0.03}
    },
    "A2": {
        "base_title": "Garden Party Elegance",
        "venue_preference": "garden_outdoor",
        "catering_style": "gourmet_buffet",
        "decorations": "Natural florals & fairy light canopies",
        "entertainment": "Acoustic duo + DJ for dancing",
        "service_level": "Personalized but relaxed service",
        "unique_features": ["Outdoor ceremony space", "Sunset photo session", "Garden cocktails"],
        "target_per_person": 5500,
        "venue_weight": 0.35,
        "catering_weight": 0.35,
        "other_weights": {"decoration": 0.20, "entertainment": 0.07, "logistics": 0.03}
    },
    "A3": {
        "base_title": "Modern Minimalist Chic",
        "venue_preference": "modern_space",
        "catering_style": "contemporary_stations",
        "decorations": "Clean lines & dramatic lighting",
        "entertainment": "Premium DJ + light show",
        "service_level": "Efficient modern service",
        "unique_features": ["Interactive food stations", "LED lighting design", "Photo booth"],
        "target_per_person": 4200,
        "venue_weight": 0.40,
        "catering_weight": 0.25,
        "other_weights": {"decoration": 0.12, "entertainment": 0.15, "logistics": 0.08}
    },
    "A4": {
        "base_title": "Cultural Heritage Celebration",
        "venue_preference": "cultural_historic",
        "catering_style": "traditional_family",
        "decorations": "Traditional motifs & cultural elements",
        "entertainment": "Cultural performances + modern music",
        "service_level": "Family-style hospitality",
        "unique_features": ["Traditional ceremony elements", "Cultural food presentation", "Heritage decorations"],
        "target_per_person": 3800,
        "venue_weight": 0.30,
        "catering_weight": 0.40,
        "other_weights": {"decoration": 0.18, "entertainment": 0.09, "logistics": 0.03}
    }
}

def _round_and_fix(total: int, parts: List[Tuple[str, float]]):
    raw = [(c, round(total * p)) for c, p in parts]
    diff = total - sum(v for _, v in raw)
    if diff != 0:
        idx = max(range(len(raw)), key=lambda i: raw[i][1])
        c, v = raw[idx]
        raw[idx] = (c, v + diff)
    return raw

def generate_costs(total_budget_lkr: int, concept_id: str = "A1"):
    """Generate costs based on concept theme"""
    theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
    
    # Create budget split based on concept preferences
    concept_split = [
        ("venue", theme["venue_weight"]),
        ("catering", theme["catering_weight"]),
    ]
    
    # Add other categories
    for category, weight in theme["other_weights"].items():
        concept_split.append((category, weight))
    
    return _round_and_fix(total_budget_lkr, concept_split)

def compress_milestones(event_date: _date):
    days_to_event = (event_date - _date.today()).days
    ms = list(MILESTONES)

    if days_to_event < 30:
        scale = max(days_to_event / 30.0, 0.2)
        ms[0] = (int(round(-30 * scale)), ms[0][1])
        ms[1] = (int(round(-21 * scale)), ms[1][1])

    if days_to_event < 7:
        ms[2] = (-5, ms[2][1])   # was -14
        ms[3] = (-2, ms[3][1])   # was -7

    return [(off if off <= 0 else 0, label) for off, label in ms]

def apply_venue_lead_time(event_date: _date, milestones, lead_days: int):
    """
    Ensure a 'Book venue' milestone at -lead_days (or as early as possible if event is sooner).
    Deduplicate labels and return sorted by offset asc.
    """
    if lead_days <= 0:
        return milestones

    days_to_event = (event_date - _date.today()).days
    desired = -int(lead_days)
    if days_to_event < lead_days:
        desired = -max(days_to_event - 1, 0)

    labeled = [m for m in milestones]
    labels = [lbl for _, lbl in labeled]
    if "Book venue" not in labels:
        labeled.insert(0, (desired, "Book venue"))
    else:
        labeled = [(desired if lbl == "Book venue" else off, lbl) for off, lbl in labeled]

    labeled = [(off if off <= 0 else 0, lbl) for off, lbl in labeled]

    dedup = {}
    for off, lbl in labeled:
        if lbl not in dedup or off < dedup[lbl]:
            dedup[lbl] = off
    out = sorted([(off, lbl) for lbl, off in dedup.items()], key=lambda x: x[0])
    return out

def concept_ids(n: int) -> List[str]:
    return [f"A{i}" for i in range(1, n + 1)]

def pick_title(concept_id: str, event_type: str = "default") -> str:
    """Get event-specific concept title"""
    event_type = event_type.lower() if event_type else "default"
    
    # Get event-specific names or fall back to default
    event_names = EVENT_CONCEPT_NAMES.get(event_type, EVENT_CONCEPT_NAMES["default"])
    return event_names.get(concept_id, CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])["base_title"])

def pick_concept_details(concept_id: str, event_type: str = "default") -> dict:
    """Get concept details with dynamic title based on event type"""
    details = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"]).copy()
    details["title"] = pick_title(concept_id, event_type)
    return details

def pick_assumptions(concept_id: str) -> List[str]:
    theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
    return [
        f"Venue: {theme['venue_preference'].replace('_', ' ').title()}",
        f"Catering: {theme['catering_style'].replace('_', ' ').title()}",
        f"Decorations: {theme['decorations']}",
        f"Entertainment: {theme['entertainment']}",
        f"Service: {theme['service_level']}"
    ]

def feasibility_notes(total: int, attendees: int):
    notes = []
    if attendees > 0:
        per_person = round(total / max(attendees, 1))
        notes.append(f"Approx LKR {per_person:,} per person")
    notes.append("Venue allocation is high (40%) to secure premium venue")
    if attendees >= 200 and total / max(attendees, 1) < 1500:
        notes.append("Budget appears tight for this scale; consider sponsorships or scope adjustments")
    return notes

def _as_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def calculate_venue_cost(venue_data: dict, attendees: int, concept_id: str) -> int:
    """Calculate venue cost based on selected venue and concept"""
    if not venue_data:
        theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
        # Fallback estimation based on concept target
        return int(attendees * theme["target_per_person"] * theme["venue_weight"])

    # Prefer explicit per-person pricing if supplied
    per_person_keys = [
        "per_person_lkr",
        "per_person_cost_lkr",
        "pp_cost_lkr",
        "per_person",
    ]
    for key in per_person_keys:
        pp_cost = _as_int(venue_data.get(key), 0)
        if pp_cost > 0 and attendees > 0:
            return pp_cost * attendees

    pricing_type = (venue_data.get("pricing_type") or venue_data.get("pricing_model") or "").lower()
    if pricing_type in {"per_person", "per_head"} and attendees > 0:
        base = _as_int(venue_data.get("avg_cost_lkr"), 0)
        if base > 0:
            return base * attendees

    # Treat avg_cost_lkr as a fixed rental unless told otherwise
    base_cost = _as_int(venue_data.get("avg_cost_lkr"), 0)
    if base_cost > 0:
        return base_cost

    # Estimate based on capacity and type when no explicit pricing is provided
    capacity = _as_int(venue_data.get("capacity"), attendees or 100)
    venue_type = (venue_data.get("type") or "").lower()

    if "luxury" in venue_type or "5-star" in venue_type:
        base_cost = capacity * 3000
    elif "hotel" in venue_type or "ballroom" in venue_type:
        base_cost = capacity * 2000
    elif "garden" in venue_type or "outdoor" in venue_type:
        base_cost = capacity * 1500
    else:
        base_cost = capacity * 1200

    return base_cost

def calculate_catering_cost(catering_data: dict, attendees: int, concept_id: str) -> int:
    """Calculate catering cost based on selected catering and concept"""
    if not catering_data:
        theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
        # Fallback estimation based on concept target
        return int(attendees * theme["target_per_person"] * theme["catering_weight"])

    # Direct per-person price overrides
    per_person_keys = [
        "pp_cost_lkr",
        "per_person_lkr",
        "per_person_cost_lkr",
        "pp_lkr",
    ]
    for key in per_person_keys:
        value = _as_int(catering_data.get(key), 0)
        if value > 0 and attendees > 0:
            return value * attendees

    total_keys = ["package_total_lkr", "total_cost_lkr"]
    for key in total_keys:
        value = _as_int(catering_data.get(key), 0)
        if value > 0:
            return value

    # Use range-based pricing if available
    pp_min = _as_int(catering_data.get("pp_min_lkr"), 0)
    pp_max = _as_int(catering_data.get("pp_max_lkr"), 0)

    if pp_min > 0 and pp_max > 0 and attendees > 0:
        # Use concept preference to choose within range
        theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
        if theme["catering_style"] in ["premium_plated", "gourmet_buffet"]:
            per_person = int(pp_min + (pp_max - pp_min) * 0.8)  # Higher end
        elif theme["catering_style"] == "contemporary_stations":
            per_person = int(pp_min + (pp_max - pp_min) * 0.6)  # Mid-high
        else:  # traditional_family
            per_person = int(pp_min + (pp_max - pp_min) * 0.4)  # Mid-low

        return per_person * attendees

    # Fallback if no pricing data
    theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
    return int(attendees * theme["target_per_person"] * theme["catering_weight"])

def generate_dynamic_costs(total_budget_lkr: int, concept_id: str, venue_data: dict = None, catering_data: dict = None, attendees: int = 100):
    """Generate costs with actual venue and catering selections"""
    
    # Calculate actual costs for venue and catering
    venue_cost = calculate_venue_cost(venue_data, attendees, concept_id)
    catering_cost = calculate_catering_cost(catering_data, attendees, concept_id)
    
    # Get theme for other categories
    theme = CONCEPT_THEMES.get(concept_id, CONCEPT_THEMES["A1"])
    
    # Calculate remaining budget for other categories
    fixed_costs = venue_cost + catering_cost
    remaining_budget = max(total_budget_lkr - fixed_costs, 0)
    
    # Calculate other category weights (normalize to sum to 1)
    other_weights = theme["other_weights"]
    total_other_weight = sum(other_weights.values())
    
    # Build final cost breakdown
    cost_breakdown = [
        ("venue", venue_cost),
        ("catering", catering_cost)
    ]

    if remaining_budget > 0 and total_other_weight > 0:
        other_split = [
            (category, weight / total_other_weight)
            for category, weight in other_weights.items()
        ]
        cost_breakdown.extend(_round_and_fix(remaining_budget, other_split))
    else:
        for category in other_weights.keys():
            cost_breakdown.append((category, 0))

    return cost_breakdown

def uuid() -> str:
    return str(uuid4())
