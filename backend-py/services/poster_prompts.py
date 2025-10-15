"""OpenAI helpers for richer poster prompt generation."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

try:  # Optional dependency
    from openai import OpenAI, APIError  # type: ignore
except Exception:  # pragma: no cover
    OpenAI = None  # type: ignore
    APIError = Exception  # type: ignore

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = os.getenv("OPENAI_POSTER_PROMPT_MODEL", "gpt-4o-mini")


def _client() -> Optional[Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        return None
    try:
        return OpenAI(api_key=api_key)
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to initialize OpenAI client for poster prompts: %s", exc)
        return None


@dataclass
class PromptSuggestion:
    prompt: str
    source: str


def _fallback(prompt: str) -> PromptSuggestion:
    return PromptSuggestion(prompt=prompt.strip(), source="fallback")


def suggest_background_prompt(
    *,
    event_payload: Dict[str, Any],
    base_prompt: str,
    user_query: Optional[str] = None,
) -> PromptSuggestion:
    """Return an enriched background prompt, defaulting to heuristic prompt when OpenAI unavailable."""

    combined_base = f"{base_prompt.strip()} {user_query.strip()}" if user_query else base_prompt

    client = _client()
    if client is None:
        return _fallback(combined_base)

    system_prompt = (
        "You are a senior visual designer crafting prompts for the FLUX.1 image model. "
        "Respond with JSON containing `prompt` (single string under 220 tokens)."
    )

    payload = {
        "event": event_payload,
        "existing_prompt": base_prompt,
        "user_query": user_query,
        "requirements": [
            "Highlight the venue atmosphere and musical energy",
            "Reference any palette or mood cues when provided",
            "Keep language concise but evocative",
        ],
    }

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(payload)},
            ],
            temperature=0.7,
            max_tokens=180,
            response_format={"type": "json_object"},
        )
    except APIError as exc:  # pragma: no cover
        logger.warning("OpenAI background prompt request failed: %s", exc)
        return _fallback(combined_base)
    except Exception as exc:  # pragma: no cover
        logger.warning("Unexpected OpenAI error for background prompt: %s", exc)
        return _fallback(combined_base)

    try:
        content = response.choices[0].message.content
        parsed = json.loads(content)
        prompt_text = parsed.get("prompt")
        if not prompt_text:
            raise ValueError("missing prompt field")
        return PromptSuggestion(prompt=prompt_text.strip(), source="openai")
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to parse OpenAI prompt payload: %s", exc)
        return _fallback(combined_base)


def suggest_harmonize_prompt(
    *,
    context: Dict[str, Any],
    base_prompt: str,
) -> PromptSuggestion:
    client = _client()
    if client is None:
        return _fallback(base_prompt)

    system_prompt = (
        "You are an expert in AI poster composition. Provide a JSON response with `prompt` only."
    )
    payload = {
        "context": context,
        "existing_prompt": base_prompt,
        "goal": "Blend performer cutouts seamlessly into the background while preserving mood",
    }

    try:
        response = client.chat.completions.create(
            model=_DEFAULT_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(payload)},
            ],
            temperature=0.6,
            max_tokens=160,
            response_format={"type": "json_object"},
        )
    except APIError as exc:  # pragma: no cover
        logger.warning("OpenAI harmonize prompt request failed: %s", exc)
        return _fallback(base_prompt)
    except Exception as exc:  # pragma: no cover
        logger.warning("Unexpected OpenAI error for harmonize prompt: %s", exc)
        return _fallback(base_prompt)

    try:
        content = response.choices[0].message.content
        parsed = json.loads(content)
        prompt_text = parsed.get("prompt")
        if not prompt_text:
            raise ValueError("missing prompt field")
        return PromptSuggestion(prompt=prompt_text.strip(), source="openai")
    except Exception as exc:  # pragma: no cover
        logger.warning("Failed to parse OpenAI harmonize prompt payload: %s", exc)
        return _fallback(base_prompt)
