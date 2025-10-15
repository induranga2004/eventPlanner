"""API key dependency for planner-related routes."""
from __future__ import annotations

import os
from typing import Iterable, Set

from fastapi import Header, HTTPException, status

API_KEY_HEADER = "X-API-Key"


def _configured_keys() -> Set[str]:
    raw: Iterable[str] = (
        os.getenv("PLANNER_API_KEYS") or os.getenv("PLANNER_API_KEY") or ""
    ).split(",")
    keys = {key.strip() for key in raw if key.strip()}
    return keys


def require_planner_api_key(api_key: str | None = Header(None, alias=API_KEY_HEADER)) -> str:
    keys = _configured_keys()
    if not keys:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Planner API key is not configured. Set PLANNER_API_KEY or PLANNER_API_KEYS.",
        )

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing planner API key",
        )

    if api_key not in keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid planner API key",
        )

    return api_key
