"""Planner service helpers with pluggable concept sources."""

from __future__ import annotations

from datetime import date as _date
from typing import Dict, List, Optional, Tuple
from uuid import uuid4

from agents.concept_generator import ConceptGenerationUnavailable
from models.concept import Concept
from utils.concept_repository import concept_notice, ensure_seed_concept, get_concept, list_concepts

MILESTONES = [
    (-30, "Vendor shortlist & RFPs"),
    (-21, "Confirm venue & core vendors"),
    (-14, "Lock menu & décor plan"),
    (-7, "Final run sheet + contact list"),
    (-1, "Setup & checks"),
    (0, "Event day"),
]

DEFAULT_EVENT_TYPE = "musical"

DEFAULT_COST_SPLIT = {
    "venue": 0.4,
    "music": 0.35,
    "lighting": 0.15,
    "sound": 0.10,
}


def _default_concept() -> Optional[Concept]:
    try:
        seed = ensure_seed_concept()
        return seed
    except (ConceptGenerationUnavailable, RuntimeError):
        pass

    return Concept(
        concept_id="baseline-live-showcase",
        title="Baseline Live Showcase",
        tagline="Local talent meets immersive staging.",
        venue_preference="Versatile stage with pro production",
        music_focus="Collaborative sets featuring soloists and ensembles",
        lighting_style="Dynamic color washes with beam highlights",
        sound_profile="Crystal vocals with deep rhythmic low-end",
        experience_notes="Guests enjoy a curated flow of performers with engaging visuals.",
        target_pp_lkr=2500,
        cost_split=dict(DEFAULT_COST_SPLIT),
        assumption_prompts="",
        default_features=[
            "Venue spotlight: Flagship partner",
            "Lighting design: Immersive washes",
            "Sound engineered for rich detail",
        ],
        providers={},
        catering_style="",
    )


_DEFAULT_CONCEPT = _default_concept()


def _ensure_concept(concept_id: Optional[str]) -> Concept:
    if concept_id:
        try:
            return get_concept(concept_id)
        except KeyError:
            pass
    if _DEFAULT_CONCEPT is None:
        raise RuntimeError("No concepts available. Ensure provider data is accessible.")
    return _DEFAULT_CONCEPT


def _round_and_fix(total: int, parts: List[Tuple[str, float]]) -> List[Tuple[str, int]]:
    raw = [(category, round(total * weight)) for category, weight in parts]
    diff = total - sum(value for _, value in raw)
    if diff:
        idx = max(range(len(raw)), key=lambda i: raw[i][1])
        cat, value = raw[idx]
        raw[idx] = (cat, value + diff)
    return raw


def concept_ids(n: int) -> List[str]:
    concepts = list_concepts()
    return [record.concept_id for record in concepts[: max(0, n)]]


def _normalized_split(concept: Concept) -> Dict[str, float]:
    raw_split = concept.cost_split or {}
    filtered = {k: float(v) for k, v in raw_split.items() if k in DEFAULT_COST_SPLIT and float(v) > 0}
    if not filtered:
        filtered = dict(DEFAULT_COST_SPLIT)
    total = sum(filtered.values()) or 1.0
    return {k: v / total for k, v in filtered.items()}


def generate_costs(total_budget_lkr: int, concept_id: Optional[str] = None) -> List[Tuple[str, int]]:
    concept = _ensure_concept(concept_id)
    split = _normalized_split(concept)
    return _round_and_fix(total_budget_lkr, list(split.items()))


def compress_milestones(event_date: _date):
    days_to_event = (event_date - _date.today()).days
    ms = list(MILESTONES)

    if days_to_event < 30:
        scale = max(days_to_event / 30.0, 0.2)
        ms[0] = (int(round(-30 * scale)), ms[0][1])
        ms[1] = (int(round(-21 * scale)), ms[1][1])

    if days_to_event < 7:
        ms[2] = (-5, ms[2][1])
        ms[3] = (-2, ms[3][1])

    return [(off if off <= 0 else 0, label) for off, label in ms]


def apply_venue_lead_time(event_date: _date, milestones, lead_days: int):
    """Ensure a 'Book venue' milestone aligned to lead-time requirements."""
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

    dedup: Dict[str, int] = {}
    for off, lbl in labeled:
        if lbl not in dedup or off < dedup[lbl]:
            dedup[lbl] = off
    return sorted([(off, lbl) for lbl, off in dedup.items()], key=lambda x: x[0])


def pick_title(concept_id: Optional[str]) -> str:
    return _ensure_concept(concept_id).title


def pick_concept_details(concept_id: Optional[str]) -> Dict[str, str]:
    concept = _ensure_concept(concept_id)
    return {
        "title": concept.title,
        "tagline": concept.tagline,
        "venue_preference": concept.venue_preference,
        "music_focus": concept.music_focus,
        "lighting_style": concept.lighting_style,
        "sound_profile": concept.sound_profile,
        "experience_notes": concept.experience_notes,
    }


def pick_assumptions(concept_id: Optional[str]) -> List[str]:
    concept = _ensure_concept(concept_id)
    if concept.default_features:
        return concept.default_features
    return [
        f"Venue emphasis: {concept.venue_preference.replace('_', ' ').title()}" if concept.venue_preference else "Venue emphasis: headline-ready stage",
        f"Music focus: {concept.music_focus}" if concept.music_focus else "Music focus: high-energy live sets",
        f"Lighting style: {concept.lighting_style}" if concept.lighting_style else "Lighting style: dynamic LEDs and washes",
        f"Sound profile: {concept.sound_profile}" if concept.sound_profile else "Sound profile: balanced mix for vocals and rhythm",
    ]


def feasibility_notes(total: int, attendees: int, concept_id: Optional[str] = None) -> List[str]:
    concept = _ensure_concept(concept_id)
    notes: List[str] = []
    if attendees > 0:
        per_person = round(total / max(attendees, 1))
        notes.append(f"Approx LKR {per_person:,} per person")
    if concept.tagline:
        notes.append(concept.tagline)
    notes.append("Budget mix prioritises headline musical production values.")
    if attendees >= 200 and attendees > 0 and total / attendees < 1500:
        notes.append("Budget appears tight for this scale; consider sponsorships or scope adjustments")
    notice = concept_notice()
    if notice and notice not in notes:
        notes.append(notice)
    return notes


def _as_int(value, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _target_total(concept: Concept, attendees: int) -> int:
    if attendees <= 0:
        return concept.target_pp_lkr * 100
    return concept.target_pp_lkr * attendees


def _fallback_weight(concept: Concept, key: str, default: float) -> float:
    split = _normalized_split(concept)
    return split.get(key, default)


def calculate_venue_cost(venue_data: dict, attendees: int, concept_id: Optional[str]) -> int:
    concept = _ensure_concept(concept_id)
    if not venue_data:
        return int(_target_total(concept, attendees) * _fallback_weight(concept, "venue", 0.4))

    per_person_keys = ["per_person_lkr", "per_person_cost_lkr", "pp_cost_lkr", "per_person"]
    for key in per_person_keys:
        pp_cost = _as_int(venue_data.get(key), 0)
        if pp_cost > 0 and attendees > 0:
            return pp_cost * attendees

    standard_rate = _as_int(venue_data.get("standard_rate_lkr") or venue_data.get("standardRate"), 0)
    if standard_rate <= 0:
        standard_rate = _as_int((venue_data.get("pricing") or {}).get("standardRate"), 0)

    pricing_type = (venue_data.get("pricing_type") or venue_data.get("pricing_model") or "").lower()
    if pricing_type in {"per_person", "per_head"} and attendees > 0:
        base = _as_int(venue_data.get("avg_cost_lkr"), 0)
        if base > 0:
            return base * attendees
        if standard_rate > 0:
            return standard_rate * attendees

    base_cost = _as_int(venue_data.get("avg_cost_lkr"), 0)
    if base_cost <= 0 and standard_rate > 0:
        base_cost = standard_rate

    if base_cost > 0:
        return base_cost

    capacity = _as_int(venue_data.get("capacity"), attendees or 100)
    venue_type = (venue_data.get("type") or "").lower()

    if "luxury" in venue_type or "5-star" in venue_type:
        base_cost = capacity * 3000
    elif any(token in venue_type for token in ("hotel", "ballroom")):
        base_cost = capacity * 2000
    elif any(token in venue_type for token in ("garden", "outdoor")):
        base_cost = capacity * 1500
    else:
        base_cost = capacity * 1200

    return base_cost


def generate_dynamic_costs(
    total_budget_lkr: int,
    concept_id: Optional[str],
    venue_data: dict = None,
    attendees: int = 100,
) -> List[Tuple[str, int]]:
    concept = _ensure_concept(concept_id)
    split = _normalized_split(concept)

    venue_cost = calculate_venue_cost(venue_data, attendees, concept.concept_id)
    remaining_budget = max(total_budget_lkr - venue_cost, 0)

    other_weights = [(key, weight) for key, weight in split.items() if key != "venue"]

    cost_breakdown: List[Tuple[str, int]] = [("venue", venue_cost)]

    if other_weights:
        total_other = sum(weight for _, weight in other_weights)
        if total_other <= 0:
            normalized = [(key, 1 / len(other_weights)) for key, _ in other_weights]
        else:
            normalized = [(key, weight / total_other) for key, weight in other_weights]
        cost_breakdown.extend(_round_and_fix(remaining_budget, normalized))
    elif remaining_budget > 0:
        category, amount = cost_breakdown[0]
        cost_breakdown[0] = (category, amount + remaining_budget)

    present = {category for category, _ in cost_breakdown}
    for key, _ in other_weights:
        if key not in present:
            cost_breakdown.append((key, 0))

    return cost_breakdown


def uuid() -> str:
    return str(uuid4())
