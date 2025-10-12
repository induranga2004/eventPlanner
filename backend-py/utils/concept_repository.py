from __future__ import annotations

import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from models.concept import Concept
from utils.data_loader import load_concepts as load_csv_concepts

from .mongo_client import MongoUnavailable, get_collection, mongo_available

if TYPE_CHECKING:  # pragma: no cover - typing only
    try:
        from pymongo.errors import PyMongoError as _PyMongoError  # type: ignore
    except Exception:  # pragma: no cover - optional dependency missing
        _PyMongoError = Exception  # type: ignore
else:  # pragma: no cover - runtime fallback when pymongo absent
    class _PyMongoError(Exception):
        ...

PyMongoError = _PyMongoError

from agents.concept_generator import ConceptGenerationUnavailable, generate_concept

logger = logging.getLogger(__name__)

_BOOL_TRUE = {"1", "true", "yes", "on"}
_COLLECTION_ENV = "MONGO_CONCEPTS_COLLECTION"
_DEFAULT_COLLECTION = "concepts"


def _use_ai_concepts() -> bool:
    return os.getenv("USE_AI_CONCEPTS", "0").strip().lower() in _BOOL_TRUE


def _collection() -> Any:
    name = os.getenv(_COLLECTION_ENV, _DEFAULT_COLLECTION)
    return get_collection(name)


def _document_to_concept(doc: Dict) -> Concept:
    data = dict(doc)
    data.pop("_id", None)
    return Concept(**data)


def _load_from_mongo(limit: Optional[int]) -> List[Concept]:
    if not mongo_available():
        return []

    try:
        collection = _collection()
    except MongoUnavailable as exc:
        logger.debug("Concept collection unavailable: %s", exc)
        return []

    try:
        cursor = collection.find().sort("updated_at", -1)
        if limit:
            cursor = cursor.limit(int(limit))
        docs = list(cursor)
    except PyMongoError as exc:  # pragma: no cover - external io
        logger.error("Failed to fetch concepts from Mongo: %s", exc)
        return []

    return [_document_to_concept(doc) for doc in docs]


def _seed_via_ai(context: Optional[Dict] = None) -> List[Concept]:
    try:
        collection = _collection()
    except MongoUnavailable as exc:
        raise ConceptGenerationUnavailable(str(exc)) from exc

    payload = generate_concept(context)
    payload.setdefault("concept_id", "ai_concept_001")
    payload["updated_at"] = datetime.utcnow()

    try:
        collection.update_one(
            {"concept_id": payload["concept_id"]},
            {"$set": payload},
            upsert=True,
        )
    except PyMongoError as exc:  # pragma: no cover
        logger.error("Failed to store AI concept: %s", exc)
        raise ConceptGenerationUnavailable("Unable to persist generated concept") from exc

    return _load_from_mongo(limit=None)


def _transform_csv_records(limit: Optional[int]) -> List[Concept]:
    records = load_csv_concepts()
    concepts = []
    for idx, record in enumerate(records.values()):
        concept = Concept(
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
        concepts.append(concept)
        if limit and len(concepts) >= limit:
            break
    return concepts


def ensure_seed_concept(context: Optional[Dict] = None) -> Concept:
    """Ensure at least one concept exists in Mongo when AI mode is enabled."""

    if not _use_ai_concepts():
        concepts = _transform_csv_records(limit=1)
        if not concepts:
            raise RuntimeError("No concepts available from CSV fallback.")
        return concepts[0]

    concepts = _load_from_mongo(limit=1)
    if concepts:
        return concepts[0]

    seeded = _seed_via_ai(context)
    if not seeded:
        raise ConceptGenerationUnavailable("AI seeding returned no concepts")
    return seeded[0]


def list_concepts(limit: Optional[int] = None) -> List[Concept]:
    if _use_ai_concepts():
        concepts = _load_from_mongo(limit)
        if concepts:
            return concepts
        try:
            seeded = _seed_via_ai(context=None)
            if limit:
                return seeded[:limit]
            return seeded
        except ConceptGenerationUnavailable as exc:
            logger.warning("AI seeding failed, falling back to CSV: %s", exc)
    return _transform_csv_records(limit)


def get_concept(concept_id: str) -> Concept:
    if _use_ai_concepts():
        for concept in _load_from_mongo(limit=None):
            if concept.concept_id == concept_id:
                return concept
        try:
            seeded = _seed_via_ai(context={"concept_id": concept_id})
            for concept in seeded:
                if concept.concept_id == concept_id:
                    return concept
        except ConceptGenerationUnavailable:
            logger.warning("Unable to generate concept %s via AI, trying CSV fallback", concept_id)

    records = load_csv_concepts()
    try:
        record = records[concept_id]
    except KeyError as exc:
        raise KeyError(f"Unknown concept_id '{concept_id}'") from exc

    return Concept(
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
