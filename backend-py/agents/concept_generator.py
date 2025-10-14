from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict, Iterable

from openai import APIError, OpenAI

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = os.getenv("OPENAI_CONCEPT_MODEL", "gpt-4o-mini")
_ALLOWED_COST_KEYS = ("venue", "music", "lighting", "sound")
_DEFAULT_COST_SPLIT = {
    "venue": 0.4,
    "music": 0.35,
    "lighting": 0.15,
    "sound": 0.10,
}


class ConceptGenerationUnavailable(RuntimeError):
    """Raised when OpenAI-based concept generation cannot proceed."""


class ConceptGenerationQuotaExceeded(ConceptGenerationUnavailable):
    """Raised when OpenAI quota is exhausted and CSV fallback should be used."""


def _client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ConceptGenerationUnavailable("OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def _render_providers(label: str, values: Iterable[str]) -> str:
    cleaned = [v for v in (value.strip() for value in values) if v]
    if not cleaned:
        return f"{label}: none"
    sample = ", ".join(cleaned[:8])
    return f"{label}: {sample}"


def _build_messages(context: Dict[str, Any]) -> list[Dict[str, str]]:
    audience = context.get("audience", "concert fans")
    budget = context.get("budget_lkr", 2_000_000)
    attendees = context.get("attendees", 200)
    vibe = context.get("vibe", "high-energy musical night")
    city = context.get("city", "Colombo")

    talent_lists = context.get("talent_lists") or {}
    provider_summary = context.get("providers") or {}

    venue_hosts = talent_lists.get("venues") or provider_summary.get("venue") or []
    solo_musicians = talent_lists.get("solo_musicians") or []
    ensembles = talent_lists.get("music_ensembles") or []
    lighting = talent_lists.get("lighting_designers") or provider_summary.get("lighting") or []
    sound = talent_lists.get("sound_specialists") or provider_summary.get("sound") or []

    provider_lines = "\n".join(
        [
            _render_providers("Venue hosts", venue_hosts),
            _render_providers("Solo musicians", solo_musicians),
            _render_providers("Music ensembles", ensembles),
            _render_providers("Lighting designers", lighting),
            _render_providers("Sound specialists", sound),
        ]
    )

    system_prompt = (
        "You craft concise live entertainment concepts. Always reply with strict JSON (no markdown)."
    )
    user_prompt = f"""
We are planning a musical experience in {city}. Use the available talent lists to craft an event concept name and structure.

Provide a JSON object with keys:
- concept_id: lowercase hyphenated identifier
- title: 6 words or fewer
- tagline: punchy 12 words or fewer
- experience_notes: 2 short sentences about atmosphere and guest journey
- target_pp_lkr: integer per person budget suggestion
- cost_split: object with keys venue, music, lighting, sound (values sum to 1)
- default_features: array of 3 short feature statements (<= 12 words) referencing strengths or talent types
- venue_preference: short descriptor of venue vibe we should book
- music_focus: summary of musical direction and standout acts
- lighting_style: how lighting should feel
- sound_profile: short note on sound design priorities
- providers: object mapping each category (venue, music, lighting, sound) to up to 3 recommended names from the talent lists

Constraints:
- Use only the categories listed for cost_split.
- Base tone on {vibe}. Audience: {audience}. Expected attendees: {attendees}. Budget target: LKR {budget}.
- Stick to the available provider names when suggesting spotlight talent.

Talent data:
{provider_lines}
"""

    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def generate_concept(context: Dict[str, Any] | None = None) -> Dict[str, Any]:
    """Generate a single concept payload via OpenAI with a tiny prompt."""

    context = context or {}
    messages = _build_messages(context)
    client = _client()

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=messages,
            temperature=float(os.getenv("OPENAI_CONCEPT_TEMPERATURE", "0.4")),
            max_tokens=int(os.getenv("OPENAI_CONCEPT_MAX_TOKENS", "300")),
            response_format={"type": "json_object"},
        )
    except (APIError, Exception) as exc:  # pragma: no cover - network boundary
        logger.error("Concept generation failed: %s", exc)
        message = str(exc)
        lowered = message.lower()
        if any(token in lowered for token in ("insufficient_quota", "exceeded your current quota", "quota")):
            raise ConceptGenerationQuotaExceeded("OpenAI quota exhausted; using CSV fallback.") from exc
        raise ConceptGenerationUnavailable(message) from exc

    content = response.choices[0].message.content if response.choices else None
    if not content:
        raise ConceptGenerationUnavailable("OpenAI returned no content")

    try:
        payload = json.loads(content)
    except json.JSONDecodeError as exc:
        logger.error("Concept JSON malformed: %s", exc)
        raise ConceptGenerationUnavailable("Model returned invalid JSON") from exc

    # Ensure minimum required fields for planner compatibility.
    payload.setdefault("concept_id", context.get("concept_id", "ai-concept-001"))
    payload.setdefault("title", "AI Crafted Concert")
    payload.setdefault("tagline", "Immersive live energy")
    payload.setdefault("experience_notes", "Polished staging and crowd engagement focus.")
    payload.setdefault("target_pp_lkr", context.get("target_pp_lkr", 2500))
    cost_split = payload.get("cost_split") or {}
    filtered_split = {
        key: float(cost_split.get(key, 0))
        for key in _ALLOWED_COST_KEYS
        if float(cost_split.get(key, 0)) > 0
    }
    if not filtered_split:
        filtered_split = dict(_DEFAULT_COST_SPLIT)
    payload["cost_split"] = filtered_split
    payload.setdefault(
        "default_features",
        [
            "Immersive lighting arcs",
            "Laser-synced performance cues",
            "Curated playlist transitions",
        ],
    )
    payload.setdefault("venue_preference", "premium musical hall")
    payload.setdefault("music_focus", "High-energy collaborations")
    payload.setdefault("lighting_style", "Dynamic beams with warm washes")
    payload.setdefault("sound_profile", "Full-spectrum, low-end rich mix")
    payload.setdefault("providers", {})

    providers = payload["providers"]
    sanitized_providers = {}
    if isinstance(providers, dict):
        for key, values in providers.items():
            if key not in _ALLOWED_COST_KEYS:
                continue
            if isinstance(values, list):
                sanitized_providers[key] = [str(value) for value in values[:3] if str(value).strip()]
    payload["providers"] = sanitized_providers

    # Maintain backwards compatibility for older fields expected downstream
    payload.setdefault("catering_style", "")

    return payload
