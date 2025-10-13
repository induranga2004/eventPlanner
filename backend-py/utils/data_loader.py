from __future__ import annotations

import csv
import json
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Dict, List, Optional

_BASE_DIR = os.path.dirname(os.path.dirname(__file__))
_DATA_DIR = os.path.join(_BASE_DIR, "data")
_CONCEPTS_DEFAULT = os.path.join(_DATA_DIR, "concert_concepts.csv")


@dataclass(frozen=True)
class ConceptRecord:
    concept_id: str
    title: str
    tagline: str
    venue_preference: str
    catering_style: str
    experience_notes: str
    target_pp_lkr: int
    cost_split: Dict[str, float]
    assumption_prompts: str
    default_features: List[str]

    @property
    def normalized_split(self) -> Dict[str, float]:
        total = sum(self.cost_split.values())
        if not total:
            return self.cost_split
        return {k: v / total for k, v in self.cost_split.items()}


def _parse_cost_split(raw: str) -> Dict[str, float]:
    if not raw:
        return {}
    raw = raw.strip()
    try:
        as_json = json.loads(raw)
        if isinstance(as_json, dict):
            return {str(k): float(v) for k, v in as_json.items()}
    except json.JSONDecodeError:
        pass
    parts = [p for p in raw.replace(" ", "").split(";") if p]
    split: Dict[str, float] = {}
    for part in parts:
        if ":" not in part:
            continue
        k, v = part.split(":", 1)
        try:
            split[k] = float(v)
        except ValueError:
            continue
    return split


def _parse_default_features(raw: str) -> List[str]:
    if not raw:
        return []
    return [item.strip() for item in raw.split(";") if item.strip()]


@lru_cache(maxsize=1)
def load_concepts(path: Optional[str] = None) -> Dict[str, ConceptRecord]:
    csv_path = path or _CONCEPTS_DEFAULT
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Concept CSV not found at {csv_path}")

    store: Dict[str, ConceptRecord] = {}
    with open(csv_path, "r", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            concept_id = (row.get("concept_id") or "").strip()
            if not concept_id:
                continue
            cost_split = _parse_cost_split(row.get("cost_split", ""))
            record = ConceptRecord(
                concept_id=concept_id,
                title=(row.get("title") or concept_id).strip(),
                tagline=(row.get("tagline") or "").strip(),
                venue_preference=(row.get("venue_preference") or "").strip(),
                catering_style=(row.get("catering_style") or "").strip(),
                experience_notes=(row.get("experience_notes") or "").strip(),
                target_pp_lkr=int(float(row.get("target_pp_lkr", 0) or 0)),
                cost_split=cost_split,
                assumption_prompts=(row.get("assumption_prompts") or "").strip(),
                default_features=_parse_default_features(row.get("default_features", "")),
            )
            store[concept_id] = record
    if not store:
        raise ValueError("Concept CSV loaded but no records were parsed")
    return store


def get_concept(concept_id: str) -> ConceptRecord:
    store = load_concepts()
    try:
        return store[concept_id]
    except KeyError as exc:
        raise KeyError(f"Unknown concept_id '{concept_id}'. Available: {list(store)}") from exc


def list_concepts(limit: Optional[int] = None) -> List[ConceptRecord]:
    values = list(load_concepts().values())
    return values if limit is None else values[:limit]
