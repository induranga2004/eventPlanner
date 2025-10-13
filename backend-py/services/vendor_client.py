import logging
import os
import time
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

VENDOR_SERVICE_BASE = (os.getenv("VENDOR_SERVICE_BASE") or os.getenv("VENDOR_API_BASE") or "").rstrip("/")
VENDOR_SERVICE_TOKEN = os.getenv("VENDOR_SERVICE_TOKEN") or os.getenv("SERVICE_VENDOR_TOKEN")
_CACHE_TTL_SECONDS = int(os.getenv("VENDOR_CACHE_TTL", "300"))
_cached_catalog: Optional[Dict[str, List[Dict[str, Any]]]] = None
_cached_at: float = 0.0


def _headers() -> Dict[str, str]:
    headers: Dict[str, str] = {}
    if VENDOR_SERVICE_TOKEN:
        headers["x-service-token"] = VENDOR_SERVICE_TOKEN
    return headers


def _fetch_catalog_from_service() -> Dict[str, List[Dict[str, Any]]]:
    if not VENDOR_SERVICE_BASE:
        logger.warning("VENDOR_SERVICE_BASE not configured; skipping vendor catalog fetch")
        return {}

    url = f"{VENDOR_SERVICE_BASE}/api/vendors/catalog"
    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.get(url, headers=_headers())
            response.raise_for_status()
            payload = response.json()
            catalog = payload.get("catalog")
            if isinstance(catalog, dict):
                return catalog
            logger.warning("Unexpected vendor catalog payload shape: %s", type(catalog))
    except httpx.HTTPStatusError as exc:
        logger.warning("Vendor catalog request failed: %s", exc)
    except Exception as exc:  # broad so we never break planning flow
        logger.warning("Vendor catalog request error: %s", exc)
    return {}


def fetch_vendor_catalog(force_refresh: bool = False) -> Dict[str, List[Dict[str, Any]]]:
    global _cached_catalog, _cached_at

    now = time.time()
    if not force_refresh and _cached_catalog is not None:
        if now - _cached_at < _CACHE_TTL_SECONDS:
            return _cached_catalog

    catalog = _fetch_catalog_from_service()
    if catalog:
        _cached_catalog = catalog
        _cached_at = now
    return catalog or (_cached_catalog or {})


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def build_vendor_recommendations(catalog: Dict[str, List[Dict[str, Any]]], attendees: int) -> Dict[str, List[Dict[str, Any]]]:
    if not catalog:
        return {}

    recommendations: Dict[str, List[Dict[str, Any]]] = {}

    venues = catalog.get("venues", [])
    if venues:
        venues_sorted = sorted(
            venues,
            key=lambda v: (
                _safe_int(v.get("capacity") or attendees) < attendees,
                abs(_safe_int(v.get("capacity") or attendees) - attendees),
                _safe_int(v.get("standardRate") or v.get("avg_cost_lkr") or 0),
            ),
        )
        recommendations["venues"] = venues_sorted[:3]

    musicians = catalog.get("soloMusicians", [])
    if musicians:
        musicians_sorted = sorted(
            musicians,
            key=lambda m: (
                _safe_int(m.get("standardRate"), 0) or 0,
                m.get("createdAt", ""),
            ),
        )
        recommendations["soloMusicians"] = musicians_sorted[:3]

    ensembles = catalog.get("ensembles", [])
    if ensembles:
        ensembles_sorted = sorted(
            ensembles,
            key=lambda e: (
                _safe_int(e.get("members"), 0),
                _safe_int(e.get("standardRate"), 0),
            ),
        )
        recommendations["ensembles"] = ensembles_sorted[:3]

    lighting = catalog.get("lighting", [])
    if lighting:
        lighting_sorted = sorted(
            lighting,
            key=lambda l: (
                _safe_int(l.get("crewSize"), 0),
                _safe_int(l.get("standardRate"), 0),
            ),
        )
        recommendations["lighting"] = lighting_sorted[:3]

    sound = catalog.get("sound", [])
    if sound:
        sound_sorted = sorted(
            sound,
            key=lambda s: (
                _safe_int(s.get("crewSize"), 0),
                _safe_int(s.get("standardRate"), 0),
            ),
        )
        recommendations["sound"] = sound_sorted[:3]

    return recommendations


__all__ = ["fetch_vendor_catalog", "build_vendor_recommendations"]
