"""Utilities for generating concept names and taglines via OpenAI."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

try:  # The OpenAI SDK is optional in some deployments
    from openai import OpenAI, APIError  # type: ignore
except Exception:  # pragma: no cover - optional dependency may be absent
    OpenAI = None  # type: ignore
    APIError = Exception  # type: ignore

logger = logging.getLogger(__name__)


_DEFAULT_MODEL = "gpt-4o-mini"


def _client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        return None
    try:
        return OpenAI(api_key=api_key)
    except Exception as exc:  # pragma: no cover - defensive guard
        logger.warning("Failed to initialize OpenAI client: %s", exc)
        return None


@dataclass
class ConceptIdentity:
    title: str
    tagline: str
    source: str = "fallback"


def _default_identity(fallback_title: str, fallback_tagline: Optional[str]) -> ConceptIdentity:
    return ConceptIdentity(
        title=fallback_title,
        tagline=fallback_tagline or "Custom event experience",
        source="fallback",
    )


def generate_concept_identity(
    *,
    event: Dict[str, Any],
    concept: Dict[str, Any],
    budget_lkr: int,
    attendees: int,
    fallback_title: str,
    fallback_tagline: Optional[str],
) -> ConceptIdentity:
    """Return a concept title/tagline, using OpenAI when available."""

    client = _client()
    if client is None:
        return _default_identity(fallback_title, fallback_tagline)

    model = os.getenv("OPENAI_CONCEPT_MODEL", _DEFAULT_MODEL)

    system_prompt = (
        "You are an award-winning event creative director. "
        "Respond with strictly formatted JSON containing `title` and `tagline`."
    )

    city = event.get("city") or concept.get("city") or "Colombo"
    mood = concept.get("lighting_style") or concept.get("music_focus")

    user_payload = {
        "event_name": event.get("name") or event.get("event_name"),
        "venue": event.get("venue"),
        "city": city,
        "date": str(event.get("date")),
        "attendees": attendees,
        "budget_lkr": budget_lkr,
        "concept": {
            "title": fallback_title,
            "tagline": fallback_tagline,
            "venue_preference": concept.get("venue_preference"),
            "music_focus": concept.get("music_focus"),
            "lighting_style": concept.get("lighting_style"),
            "sound_profile": concept.get("sound_profile"),
            "experience_notes": concept.get("experience_notes"),
        },
        "mood_hint": mood,
    }

    prompt = (
        "Generate a fresh, market-ready concept identity for this musical event.\n"
        "Return JSON with keys `title` (4-6 words) and `tagline` (10-14 words).\n"
        "Keep it specific to the city and vibe, avoid generic repetitions."
    )

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_payload)},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=120,
            response_format={"type": "json_object"},
        )
    except APIError as exc:  # pragma: no cover - network failure path
        logger.warning("OpenAI concept identity generation failed: %s", exc)
        return _default_identity(fallback_title, fallback_tagline)
    except Exception as exc:  # pragma: no cover - broad guard for reliability
        logger.warning("Unexpected OpenAI error: %s", exc)
        return _default_identity(fallback_title, fallback_tagline)

    try:
        content = response.choices[0].message.content
        parsed = json.loads(content)
    except Exception as exc:  # pragma: no cover - parsing guard
        logger.warning("Failed to parse OpenAI concept identity payload: %s", exc)
        return _default_identity(fallback_title, fallback_tagline)

    title = parsed.get("title") or fallback_title
    tagline = parsed.get("tagline") or fallback_tagline or "Custom event experience"

    return ConceptIdentity(title=title.strip(), tagline=tagline.strip(), source="openai")
