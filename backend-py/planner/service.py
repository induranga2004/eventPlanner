"""Planner service helpers with pluggable concept sources."""

from __future__ import annotations

from datetime import date as _date
from typing import Dict, List, Optional, Tuple
from uuid import uuid4

from agents.concept_generator import ConceptGenerationUnavailable
from models.concept import Concept
from utils.concept_repository import ensure_seed_concept, get_concept, list_concepts
from utils.data_loader import load_concepts as _csv_load  # Fallback diagnostics

MILESTONES = [
    (-30, "Vendor shortlist & RFPs"),
    (-21, "Confirm venue & core vendors"),
    (-14, "Lock menu & décor plan"),
    (-7, "Final run sheet + contact list"),
    (-1, "Setup & checks"),
    (0, "Event day"),
]

DEFAULT_EVENT_TYPE = "musical"


def _default_concept() -> Optional[Concept]:
    try:
        seed = ensure_seed_concept()
        return seed
    except (ConceptGenerationUnavailable, RuntimeError):
        concepts = [
            Concept(
                concept_id=record.concept_id,
                title=record.title,
                tagline=record.tagline,
                venue_preference=record.venue_preference,
                catering_style=record.catering_style,
                experience_notes=record.experience_notes,
                target_pp_lkr=record.target_pp_lkr,
                cost_split=record.cost_split,
                assumption_prompts=record.assumption_prompts,
                default_features=record.default_features,
            )
            for record in _csv_load().values()
        ]
        return concepts[0] if concepts else None


_DEFAULT_CONCEPT = _default_concept()


def _ensure_concept(concept_id: Optional[str]) -> Concept:
    if concept_id:
        try:
            return get_concept(concept_id)
        except KeyError:
            pass
    if _DEFAULT_CONCEPT is None:
        raise RuntimeError("No concepts available. Ensure concert_concepts.csv is populated.")
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
    split = concept.cost_split or {"venue": 0.4, "catering": 0.3, "production": 0.2, "logistics": 0.1}
    total = sum(split.values()) or 1.0
    return {k: v / total for k, v in split.items()}


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
        "catering_style": concept.catering_style,
        "experience_notes": concept.experience_notes,
    }


def pick_assumptions(concept_id: Optional[str]) -> List[str]:
    concept = _ensure_concept(concept_id)
    if concept.default_features:
        return concept.default_features
    return [
        f"Venue emphasis: {concept.venue_preference.replace('_', ' ').title()}" if concept.venue_preference else "Venue emphasis: headline-ready stage",
        f"Catering style: {concept.catering_style.replace('_', ' ').title()}" if concept.catering_style else "Catering style: premium service",
        concept.experience_notes or "Immersive live musical experience",
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

    pricing_type = (venue_data.get("pricing_type") or venue_data.get("pricing_model") or "").lower()
    if pricing_type in {"per_person", "per_head"} and attendees > 0:
        base = _as_int(venue_data.get("avg_cost_lkr"), 0)
        if base > 0:
            return base * attendees

    base_cost = _as_int(venue_data.get("avg_cost_lkr"), 0)
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


def calculate_catering_cost(catering_data: dict, attendees: int, concept_id: Optional[str]) -> int:
    concept = _ensure_concept(concept_id)
    if not catering_data:
        return int(_target_total(concept, attendees) * _fallback_weight(concept, "catering", 0.3))

    per_person_keys = ["pp_cost_lkr", "per_person_lkr", "per_person_cost_lkr", "pp_lkr"]
    for key in per_person_keys:
        value = _as_int(catering_data.get(key), 0)
        if value > 0 and attendees > 0:
            return value * attendees

    total_keys = ["package_total_lkr", "total_cost_lkr"]
    for key in total_keys:
        value = _as_int(catering_data.get(key), 0)
        if value > 0:
            return value

    pp_min = _as_int(catering_data.get("pp_min_lkr"), 0)
    pp_max = _as_int(catering_data.get("pp_max_lkr"), 0)

    if pp_min > 0 and pp_max > 0 and attendees > 0:
        weight = _fallback_weight(concept, "catering", 0.3)
        blend = min(max(weight, 0.0), 1.0)
        per_person = int(pp_min + (pp_max - pp_min) * blend)
        return per_person * attendees

    return int(_target_total(concept, attendees) * _fallback_weight(concept, "catering", 0.3))


def generate_dynamic_costs(
    total_budget_lkr: int,
    concept_id: Optional[str],
    venue_data: dict = None,
    catering_data: dict = None,
    attendees: int = 100,
) -> List[Tuple[str, int]]:
    concept = _ensure_concept(concept_id)
    split = _normalized_split(concept)

    venue_cost = calculate_venue_cost(venue_data, attendees, concept.concept_id)
    catering_cost = calculate_catering_cost(catering_data, attendees, concept.concept_id)

    fixed_costs = venue_cost + catering_cost
    remaining_budget = max(total_budget_lkr - fixed_costs, 0)

    other_weights = {k: v for k, v in split.items() if k not in {"venue", "catering"}}
    total_other_weight = sum(other_weights.values())

    cost_breakdown: List[Tuple[str, int]] = [
        ("venue", venue_cost),
        ("catering", catering_cost),
    ]

    if remaining_budget > 0 and total_other_weight > 0:
        normalized = [(k, weight / total_other_weight) for k, weight in other_weights.items()]
        cost_breakdown.extend(_round_and_fix(remaining_budget, normalized))
    else:
        for category in other_weights:
            cost_breakdown.append((category, 0))

    return cost_breakdown


def uuid() -> str:
    return str(uuid4())
