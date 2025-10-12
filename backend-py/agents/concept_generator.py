from __future__ import annotations

import json
import logging
import os
from typing import Any, Dict

from openai import APIError, OpenAI

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = os.getenv("OPENAI_CONCEPT_MODEL", "gpt-4o-mini")


class ConceptGenerationUnavailable(RuntimeError):
    """Raised when OpenAI-based concept generation cannot proceed."""


class ConceptGenerationQuotaExceeded(ConceptGenerationUnavailable):
    """Raised when OpenAI quota is exhausted and CSV fallback should be used."""


def _client() -> OpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ConceptGenerationUnavailable("OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def _build_messages(context: Dict[str, Any]) -> list[Dict[str, str]]:
    audience = context.get("audience", "concert fans")
    budget = context.get("budget_lkr", 2_000_000)
    attendees = context.get("attendees", 200)
    vibe = context.get("vibe", "high-energy musical night")

    system_prompt = (
        "You craft concise event concepts. Respond with strict JSON only."
    )
    user_prompt = (
        "Return JSON with keys concept_id,title,tagline,experience_notes,target_pp_lkr,"
        "cost_split,default_features,venue_preference,catering_style."
        "\nConstraints:\n- Sentences under 12 words.\n- cost_split values sum to 1."
        "\nContext:\nAudience:{audience}\nAttendees:{attendees}\nBudget_LKR:{budget}\nVibe:{vibe}"
    ).format(audience=audience, attendees=attendees, budget=budget, vibe=vibe)

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
    payload.setdefault("concept_id", context.get("concept_id", "ai_concept_001"))
    payload.setdefault("title", "AI Crafted Concert")
    payload.setdefault("tagline", "Immersive live energy")
    payload.setdefault("experience_notes", "Polished staging and crowd engagement focus.")
    payload.setdefault("target_pp_lkr", context.get("target_pp_lkr", 1500))
    payload.setdefault("cost_split", {"venue": 0.4, "catering": 0.2, "production": 0.3, "logistics": 0.1})
    payload.setdefault("default_features", ["LED light show", "Social moments stage", "Sponsor activations"])
    payload.setdefault("venue_preference", "premium_musical_hall")
    payload.setdefault("catering_style", "cocktail")

    return payload
