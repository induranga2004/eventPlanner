from __future__ import annotations

import logging
import os
from datetime import datetime
from statistics import median
from uuid import uuid4
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from models.concept import Concept
from utils.provider_repository import (
    list_lighting,
    list_music_ensembles,
    list_solo_musicians,
    list_sound_specialists,
    list_venues,
)

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

from agents.concept_generator import (
    ConceptGenerationQuotaExceeded,
    ConceptGenerationUnavailable,
    generate_concept,
)

logger = logging.getLogger(__name__)

_BOOL_TRUE = {"1", "true", "yes", "on"}
_COLLECTION_ENV = "MONGO_CONCEPTS_COLLECTION"
_DEFAULT_COLLECTION = "concepts"

_AI_DISABLED = False
_NOTICE_MESSAGE: Optional[str] = None

_ALLOWED_COST_KEYS = ("venue", "music", "lighting", "sound")
_DEFAULT_COST_SPLIT: Dict[str, float] = {
    "venue": 0.4,
    "music": 0.35,
    "lighting": 0.15,
    "sound": 0.10,
}
_DEFAULT_ATTENDEES = 200


def _env_ai_enabled() -> bool:
    return os.getenv("USE_AI_CONCEPTS", "0").strip().lower() in _BOOL_TRUE


def _ai_enabled() -> bool:
    return _env_ai_enabled() and not _AI_DISABLED


def _set_notice(message: str) -> None:
    global _NOTICE_MESSAGE
    _NOTICE_MESSAGE = message


def _disable_ai(reason: str) -> None:
    global _AI_DISABLED
    if not reason:
        reason = "OpenAI concept generation unavailable; using provider fallback."
    _AI_DISABLED = True
    _set_notice(reason)
    logger.warning(reason)


def concept_notice() -> Optional[str]:
    """Return the latest concept pipeline notice (if any)."""

    return _NOTICE_MESSAGE


def _collection() -> Any:
    name = os.getenv(_COLLECTION_ENV, _DEFAULT_COLLECTION)
    return get_collection(name)


def _document_to_concept(doc: Dict) -> Concept:
    data = dict(doc)
    data.pop("_id", None)
    return Concept(**data)


def _safe_fetch(fn, *args, **kwargs) -> List[Dict[str, Any]]:
    try:
        result = fn(*args, **kwargs)
        return result or []
    except Exception as exc:  # pragma: no cover - defensive for optional deps
        logger.warning("Provider fetch failed for %s: %s", getattr(fn, "__name__", fn), exc)
        return []


def _provider_snapshot(city: Optional[str] = None, limit: int = 6) -> Dict[str, List[Dict[str, Any]]]:
    return {
        "venues": _safe_fetch(list_venues, city=city, limit=limit),
        "solo_musicians": _safe_fetch(list_solo_musicians, city=city, limit=limit),
        "music_ensembles": _safe_fetch(list_music_ensembles, city=city, limit=limit),
        "lighting_designers": _safe_fetch(list_lighting, city=city, limit=limit),
        "sound_specialists": _safe_fetch(list_sound_specialists, city=city, limit=limit),
    }


def _provider_names(items: List[Dict[str, Any]]) -> List[str]:
    names: List[str] = []
    for item in items:
        name = item.get("name") or item.get("companyName") or item.get("bandName")
        if name:
            display = str(name).strip()
            if display and display not in names:
                names.append(display)
    return names


def _combine_unique(*groups: List[str]) -> List[str]:
    seen = set()
    ordered: List[str] = []
    for group in groups:
        for value in group:
            if value not in seen:
                ordered.append(value)
                seen.add(value)
    return ordered


def _infer_city(snapshot: Dict[str, List[Dict[str, Any]]]) -> str:
    for venue in snapshot.get("venues", []):
        city = venue.get("city") or venue.get("address")
        if isinstance(city, str) and city.strip():
            return city.strip()
    return os.getenv("DEFAULT_CONCEPT_CITY", "Colombo")


def _extract_rates(entries: List[Dict[str, Any]], *keys: str) -> List[int]:
    rates: List[int] = []
    for entry in entries:
        for key in keys:
            value = entry.get(key)
            if isinstance(value, (int, float)) and value > 0:
                rates.append(int(value))
                break
    return rates


def _estimate_target_pp(snapshot: Dict[str, List[Dict[str, Any]]], attendees: int) -> int:
    attendees = max(attendees, 50)

    venue_costs = _extract_rates(snapshot.get("venues", []), "avg_cost_lkr", "standard_rate_lkr")
    music_rates = _extract_rates(
        snapshot.get("solo_musicians", []) + snapshot.get("music_ensembles", []),
        "standard_rate_lkr",
    )
    lighting_rates = _extract_rates(snapshot.get("lighting_designers", []), "standard_rate_lkr")
    sound_rates = _extract_rates(snapshot.get("sound_specialists", []), "standard_rate_lkr")

    venue_base = int(median(venue_costs)) if venue_costs else 600_000
    top_musicians = sorted(music_rates, reverse=True)[:3] or [250_000]
    music_base = sum(top_musicians)
    lighting_base = int(median(lighting_rates)) if lighting_rates else 150_000
    sound_base = int(median(sound_rates)) if sound_rates else 120_000

    total_budget = venue_base + music_base + lighting_base + sound_base
    target_pp = max(int(total_budget / attendees), 1500)
    return target_pp


def _build_context(context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    base_context = dict(context or {})
    snapshot = _provider_snapshot(limit=6)
    base_context.setdefault("provider_snapshot", snapshot)

    venue_names = _provider_names(snapshot.get("venues", []))
    solo_names = _provider_names(snapshot.get("solo_musicians", []))
    ensemble_names = _provider_names(snapshot.get("music_ensembles", []))
    lighting_names = _provider_names(snapshot.get("lighting_designers", []))
    sound_names = _provider_names(snapshot.get("sound_specialists", []))

    providers = {
        "venue": venue_names,
        "music": _combine_unique(solo_names, ensemble_names),
        "lighting": lighting_names,
        "sound": sound_names,
    }

    talent_lists = {
        "venues": venue_names,
        "solo_musicians": solo_names,
        "music_ensembles": ensemble_names,
        "lighting_designers": lighting_names,
        "sound_specialists": sound_names,
    }

    base_context.setdefault("providers", providers)
    base_context.setdefault("talent_lists", talent_lists)
    base_context.setdefault("attendees", _DEFAULT_ATTENDEES)
    base_context.setdefault("audience", "Live music fans")
    base_context.setdefault("vibe", "High-energy musical night")
    base_context.setdefault("city", _infer_city(snapshot))

    target_pp = _estimate_target_pp(snapshot, attendees=base_context["attendees"])
    base_context.setdefault("target_pp_lkr", target_pp)
    base_context.setdefault("budget_lkr", target_pp * base_context["attendees"])

    return base_context


def _fallback_features(providers: Dict[str, List[str]]) -> List[str]:
    features: List[str] = []
    if providers.get("venue"):
        features.append(f"Venue spotlight: {providers['venue'][0]}")
    if providers.get("music"):
        features.append(f"Live collaborations with {providers['music'][0]}")
    if providers.get("lighting"):
        features.append(f"Lighting design by {providers['lighting'][0]}")
    if providers.get("sound"):
        features.append(f"Sound engineered by {providers['sound'][0]}")
    return features[:3]


def _fallback_concept(context: Dict[str, Any]) -> Concept:
    providers = context.get("providers", {})
    features = _fallback_features(providers)
    if not features:
        features = [
            "Immersive stage design",
            "Curated performer transitions",
            "Audience engagement moments",
        ]

    concept_id = context.get("concept_id") or "fallback-live-showcase"
    title = context.get("title") or f"{context.get('city', 'Colombo')} Live Showcase"
    tagline = context.get("tagline") or "Local talent, synced lights, unforgettable sound."

    return Concept(
        concept_id=concept_id,
        title=title,
        tagline=tagline,
        venue_preference="Versatile stage with pro production",
        music_focus="Collaborative sets featuring local soloists and ensembles",
        lighting_style="Dynamic color washes with beam highlights",
        sound_profile="Crystal vocals with deep rhythmic low-end",
        experience_notes="Guests move through an immersive musical journey with seamless set changes.",
        target_pp_lkr=context.get("target_pp_lkr", 2500),
        cost_split=context.get("cost_split", dict(_DEFAULT_COST_SPLIT)),
        assumption_prompts="",
        default_features=features,
        providers=providers,
        catering_style="",
    )


def _sanitize_cost_split(values: Dict[str, Any]) -> Dict[str, float]:
    if not values:
        return dict(_DEFAULT_COST_SPLIT)
    sanitized: Dict[str, float] = {}
    for key in _ALLOWED_COST_KEYS:
        raw = values.get(key)
        try:
            number = float(raw)
        except (TypeError, ValueError):
            continue
        if number > 0:
            sanitized[key] = number
    if not sanitized:
        sanitized = dict(_DEFAULT_COST_SPLIT)
    total = sum(sanitized.values())
    if not total:
        return dict(_DEFAULT_COST_SPLIT)
    return {k: v / total for k, v in sanitized.items()}

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
    if context is None or "providers" not in context:
        context_data = _build_context(context)
    else:
        context_data = dict(context)

    try:
        collection = _collection()
    except MongoUnavailable as exc:
        raise ConceptGenerationUnavailable(str(exc)) from exc

    payload = generate_concept(context_data)
    concept_id = payload.get("concept_id") or f"ai-concept-{uuid4().hex[:8]}"
    payload["concept_id"] = concept_id
    payload["cost_split"] = _sanitize_cost_split(payload.get("cost_split"))
    try:
        payload["target_pp_lkr"] = int(payload.get("target_pp_lkr") or context_data.get("target_pp_lkr", 2500))
    except (TypeError, ValueError):
        payload["target_pp_lkr"] = context_data.get("target_pp_lkr", 2500)

    payload.setdefault("providers", context_data.get("providers", {}))
    payload.setdefault("venue_preference", "Versatile stage with pro production")
    payload.setdefault("music_focus", "Collaborative sets featuring local soloists and ensembles")
    payload.setdefault("lighting_style", "Dynamic color washes with beam highlights")
    payload.setdefault("sound_profile", "Crystal vocals with deep rhythmic low-end")
    if not payload.get("default_features"):
        payload["default_features"] = _fallback_features(payload["providers"])
    payload.setdefault("assumption_prompts", "")
    payload.setdefault("catering_style", "")
    payload["context_city"] = context_data.get("city")
    payload["context_attendees"] = context_data.get("attendees")
    payload["updated_at"] = datetime.utcnow()

    try:
        collection.update_one(
            {"concept_id": concept_id},
            {"$set": payload},
            upsert=True,
        )
    except PyMongoError as exc:  # pragma: no cover
        logger.error("Failed to store AI concept: %s", exc)
        raise ConceptGenerationUnavailable("Unable to persist generated concept") from exc

    return _load_from_mongo(limit=None)


def ensure_seed_concept(context: Optional[Dict] = None) -> Concept:
    """Ensure at least one concept exists in Mongo when AI mode is enabled."""

    context = _build_context(context)

    if not _ai_enabled():
        return _fallback_concept(context)

    concepts = _load_from_mongo(limit=1)
    if concepts:
        return concepts[0]

    try:
        seeded = _seed_via_ai(context)
    except ConceptGenerationQuotaExceeded as exc:
        _disable_ai(str(exc))
        return _fallback_concept(context)
    except ConceptGenerationUnavailable as exc:
        logger.warning("AI seeding failed, using fallback concept: %s", exc)
        return _fallback_concept(context)

    if not seeded:
        raise ConceptGenerationUnavailable("AI seeding returned no concepts")
    return seeded[0]


def list_concepts(limit: Optional[int] = None) -> List[Concept]:
    context = _build_context()
    if _ai_enabled():
        concepts = _load_from_mongo(limit)
        if concepts:
            return concepts[:limit] if limit else concepts
        try:
            seeded = _seed_via_ai(context)
            if limit:
                return seeded[:limit]
            return seeded
        except ConceptGenerationQuotaExceeded as exc:
            _disable_ai(str(exc))
            logger.warning("AI quota exhausted; reverting to fallback concept.")
        except ConceptGenerationUnavailable as exc:
            logger.warning("AI generation unavailable; using fallback concept (%s)", exc)
    
    # Generate multiple unique fallback concepts when requested
    fallback_base = _fallback_concept(context)
    requested = limit if limit and limit > 0 else 1
    fallbacks = []
    for i in range(requested):
        variant = Concept(
            concept_id=f"{fallback_base.concept_id}-{i+1}",
            title=f"{fallback_base.title} #{i+1}",
            tagline=fallback_base.tagline,
            venue_preference=fallback_base.venue_preference,
            music_focus=fallback_base.music_focus,
            lighting_style=fallback_base.lighting_style,
            sound_profile=fallback_base.sound_profile,
            experience_notes=fallback_base.experience_notes,
            target_pp_lkr=fallback_base.target_pp_lkr,
            cost_split=dict(fallback_base.cost_split),
            assumption_prompts=fallback_base.assumption_prompts,
            default_features=list(fallback_base.default_features),
            providers=dict(fallback_base.providers),
            catering_style=fallback_base.catering_style,
        )
        fallbacks.append(variant)
    return fallbacks


def get_concept(concept_id: str) -> Concept:
    context = _build_context({"concept_id": concept_id})
    if _ai_enabled():
        for concept in _load_from_mongo(limit=None):
            if concept.concept_id == concept_id:
                return concept
        try:
            seeded = _seed_via_ai(context)
            for concept in seeded:
                if concept.concept_id == concept_id:
                    return concept
        except ConceptGenerationQuotaExceeded as exc:
            _disable_ai(str(exc))
            logger.warning("AI quota exhausted while fetching %s; using fallback", concept_id)
        except ConceptGenerationUnavailable as exc:
            logger.warning("Unable to generate concept %s via AI, using fallback (%s)", concept_id, exc)

    fallback = _fallback_concept(context)
    if fallback.concept_id == concept_id:
        return fallback
    raise KeyError(f"Unknown concept_id '{concept_id}'")
