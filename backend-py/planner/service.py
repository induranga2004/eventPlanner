# backend-py/src/planner/service.py
from typing import List, Tuple
from datetime import date
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

CONCEPT_TITLE_BANK = [
    "Elegant Hall Wedding",
    "Garden Glam Reception",
    "Classic Ballroom Affair",
    "Seaside Chic Evening",
    "Urban Loft Soirée",
]

CONCEPT_ASSUMPTIONS_BANK = [
    ["Premium venue", "Plated dinner", "Live DJ + emcee", "Pastel florals"],
    ["Premium venue", "Buffet dinner", "DJ + playlist", "Fairy lights canopy"],
    ["Premium venue", "Family-style dinner", "Live acoustic duo", "Warm lighting"],
    ["Premium venue", "Mixed buffet stations", "DJ + host", "Minimalist décor"],
]

def _round_and_fix(total: int, parts: List[Tuple[str, float]]):
    raw = [(c, round(total * p)) for c, p in parts]
    diff = total - sum(v for _, v in raw)
    if diff != 0:
        idx = max(range(len(raw)), key=lambda i: raw[i][1])
        c, v = raw[idx]
        raw[idx] = (c, v + diff)
    return raw

def generate_costs(total_budget_lkr: int):
    return _round_and_fix(total_budget_lkr, CONCEPT_A_SPLIT)

def compress_milestones(event_date: date):
    from datetime import date as _date
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

def concept_ids(n: int) -> List[str]:
    return [f"A{i}" for i in range(1, n + 1)]

def pick_title(i: int) -> str:
    return CONCEPT_TITLE_BANK[i % len(CONCEPT_TITLE_BANK)]

def pick_assumptions(i: int) -> List[str]:
    return CONCEPT_ASSUMPTIONS_BANK[i % len(CONCEPT_ASSUMPTIONS_BANK)]

def feasibility_notes(total: int, attendees: int):
    notes = []
    if attendees > 0:
        per_person = round(total / max(attendees, 1))
        notes.append(f"Approx LKR {per_person:,} per person")
    notes.append("Venue allocation is high (40%) to secure premium venue")
    if attendees >= 200 and total / max(attendees, 1) < 1500:
        notes.append("Budget appears tight for this scale; consider sponsorships or scope adjustments")
    return notes

def uuid() -> str:
    return str(uuid4())
