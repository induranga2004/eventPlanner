import logging
import re
from typing import Any, Dict, Iterable, List, Optional, Tuple

from .mongo_client import MongoUnavailable, get_users_collection

try:
    from pymongo.errors import PyMongoError
except Exception:  # pragma: no cover - pymongo optional during tests
    class PyMongoError(Exception):
        ...

logger = logging.getLogger(__name__)

_ROLE_ALIASES: Dict[str, Tuple[str, ...]] = {
    "venue": ("venue", "venues", "venue host", "venue_host"),
    "lights": ("lights", "lighting", "light_provider", "lighting designer"),
    "music": ("musician", "music_band", "band", "dj"),
    "solo_musician": ("musician", "solo musician", "solo_musician", "solo-musician"),
    "music_ensemble": ("music_band", "music ensemble", "music_ensemble", "ensemble", "band"),
    "lighting_designer": ("lights", "lighting designer", "lighting", "light_provider", "lighting_designer"),
    "sound_specialist": ("sounds", "sound specialist", "sound", "audio", "sound engineer", "sound_engineer"),
}

_CITY_FIELDS = ("city", "venueAddress", "address", "companyAddress", "base_city")
_NAME_FIELDS = ("name", "companyName", "venueName", "bandName")
_CONTACT_FIELDS = ("phone", "contact", "contactPerson")
_WEBSITE_FIELDS = ("website", "spotifyLink", "youtubeLink", "facebookLink", "instagramLink")
_CAPACITY_FIELDS = ("capacity", "maxCapacity", "capacityRange")
_MIN_LEAD_FIELDS = ("minLeadDays", "leadTimeDays", "leadDays")
_RATING_FIELDS = ("rating", "avgRating", "averageRating")
_BOOL_TRUE = {"1", "true", "yes", "y", "on"}


def _coalesce(doc: Dict[str, Any], fields: Iterable[str]) -> Optional[Any]:
    for key in fields:
        value = doc.get(key)
        if value not in (None, "", []):
            return value
    return None


def _to_int(value: Any) -> Optional[int]:
    if value in (None, ""):
        return None
    if isinstance(value, bool):  # guard against True -> 1
        return None
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        digits = re.findall(r"\d+", value)
        if digits:
            # Prefer the largest number in ranges like "100-200"
            return int(digits[-1])
    return None


def _to_float(value: Any) -> Optional[float]:
    if value in (None, ""):
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        try:
            return float(value)
        except ValueError:
            return None
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
        if normalized in _BOOL_TRUE:
            return True
        if normalized == "0" or normalized in {"false", "no", "n", "off"}:
            return False
    return None


def _normalise_name(doc: Dict[str, Any]) -> Optional[str]:
    return _coalesce(doc, _NAME_FIELDS)


def _role_regex(role_key: str) -> re.Pattern:
    aliases = _ROLE_ALIASES.get(role_key, (role_key,))
    escaped = "|".join(re.escape(alias) for alias in aliases)
    return re.compile(f"^(?:{escaped})$", re.IGNORECASE)


def _city_regex(city: str) -> re.Pattern:
    return re.compile(re.escape(city), re.IGNORECASE)


def _query_users(role_key: str, city: Optional[str], limit: Optional[int]) -> List[Dict[str, Any]]:
    try:
        collection = get_users_collection()
    except MongoUnavailable as exc:
        logger.warning("Mongo unavailable for role %s: %s", role_key, exc)
        return []

    query: Dict[str, Any] = {"role": {"$regex": _role_regex(role_key)}}
    if city:
        regex = _city_regex(city)
        query["$or"] = [{field: regex} for field in _CITY_FIELDS]

    try:
        cursor = collection.find(query)
        if limit:
            cursor = cursor.limit(int(limit))
        return list(cursor)
    except PyMongoError as exc:
        logger.error("Mongo query failed for role %s: %s", role_key, exc)
        return []


def list_venues(city: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    docs = _query_users("venue", city=city, limit=limit)
    venues: List[Dict[str, Any]] = []
    for doc in docs:
        pricing = doc.get("pricing") if isinstance(doc.get("pricing"), dict) else {}
        standard_rate = _to_int(doc.get("standardRate"))
        if standard_rate is None:
            standard_rate = _to_int(pricing.get("standardRate"))

        raw_cost = (
            doc.get("avg_cost_lkr")
            or doc.get("avgCostLkr")
            or doc.get("avgCost")
            or pricing.get("avg_cost_lkr")
            or pricing.get("avgCostLkr")
            or pricing.get("avgCost")
        )
        avg_cost = _to_int(raw_cost)
        if (avg_cost is None or avg_cost == 0) and standard_rate:
            avg_cost = standard_rate

        venues.append(
            {
                "id": str(doc.get("_id")) if doc.get("_id") is not None else None,
                "name": _normalise_name(doc),
                "address": _coalesce(doc, ("venueAddress", "address")),
                "type": doc.get("venueType") or doc.get("type") or doc.get("role"),
                "capacity": _to_int(_coalesce(doc, _CAPACITY_FIELDS)) or 0,
                "avg_cost_lkr": avg_cost or 0,
                "standard_rate_lkr": standard_rate,
                "rating": _to_float(_coalesce(doc, _RATING_FIELDS)),
                "website": _coalesce(doc, _WEBSITE_FIELDS),
                "min_lead_days": _to_int(_coalesce(doc, _MIN_LEAD_FIELDS)) or 0,
                "phone": _coalesce(doc, _CONTACT_FIELDS),
                "city": _coalesce(doc, ("city",)),
                "source": "mongo_users",
            }
        )
    return venues


def find_venue_by_name(name: str) -> Optional[Dict[str, Any]]:
    if not name:
        return None
    docs = _query_users("venue", city=None, limit=None)
    target = name.strip().lower()
    for doc in docs:
        candidate = (_normalise_name(doc) or "").strip().lower()
        if candidate == target:
            return doc
    return None


def list_lighting(city: Optional[str], limit: int = 20) -> List[Dict[str, Any]]:
    docs = _query_users("lights", city=city, limit=limit)
    providers: List[Dict[str, Any]] = []
    for doc in docs:
        providers.append(
            {
                "name": _normalise_name(doc),
                "address": _coalesce(doc, ("address", "city")),
                "services": doc.get("services"),
                "crew_size": _to_int(doc.get("crewSize")),
                "website": _coalesce(doc, _WEBSITE_FIELDS),
                "contact": _coalesce(doc, _CONTACT_FIELDS),
                "standard_rate_lkr": _to_int(doc.get("standardRate")),
                "source": "mongo_users",
            }
        )
    return providers


def list_solo_musicians(city: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    docs = _query_users("solo_musician", city=city, limit=limit)
    artists: List[Dict[str, Any]] = []
    for doc in docs:
        artists.append(
            {
                "id": str(doc.get("_id")) if doc.get("_id") is not None else None,
                "name": _normalise_name(doc),
                "genres": doc.get("genres") or doc.get("genre"),
                "experience": doc.get("experience"),
                "standard_rate_lkr": _to_int(doc.get("standardRate")),
                "spotify": doc.get("spotifyLink"),
                "instagram": doc.get("instagramLink"),
                "website": _coalesce(doc, _WEBSITE_FIELDS),
                "contact": _coalesce(doc, _CONTACT_FIELDS),
                "source": "mongo_users",
            }
        )
    return artists


def list_music_ensembles(city: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    docs = _query_users("music_ensemble", city=city, limit=limit)
    ensembles: List[Dict[str, Any]] = []
    for doc in docs:
        ensembles.append(
            {
                "id": str(doc.get("_id")) if doc.get("_id") is not None else None,
                "name": _normalise_name(doc) or doc.get("bandName"),
                "genres": doc.get("genres"),
                "members": _to_int(doc.get("members")),
                "experience": doc.get("experience"),
                "standard_rate_lkr": _to_int(doc.get("standardRate")),
                "youtube": doc.get("youtubeLink"),
                "instagram": doc.get("instagramLink"),
                "website": _coalesce(doc, _WEBSITE_FIELDS),
                "contact": _coalesce(doc, _CONTACT_FIELDS),
                "source": "mongo_users",
            }
        )
    return ensembles


def list_sound_specialists(city: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
    docs = _query_users("sound_specialist", city=city, limit=limit)
    specialists: List[Dict[str, Any]] = []
    for doc in docs:
        specialists.append(
            {
                "name": _normalise_name(doc) or doc.get("companyName"),
                "services": doc.get("services"),
                "crew_size": _to_int(doc.get("crewSize")),
                "standard_rate_lkr": _to_int(doc.get("standardRate")),
                "website": _coalesce(doc, _WEBSITE_FIELDS),
                "contact": _coalesce(doc, _CONTACT_FIELDS),
                "source": "mongo_users",
            }
        )
    return specialists


__all__ = [
    "list_venues",
    "find_venue_by_name",
    "list_lighting",
    "list_solo_musicians",
    "list_music_ensembles",
    "list_sound_specialists",
]
