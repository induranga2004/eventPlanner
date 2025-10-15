"""FastAPI endpoint tests for planner provider catalog."""

from __future__ import annotations

import pathlib
import sys
from typing import Any, Dict, List

import os

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Ensure planner API key is available before importing the app
os.environ.setdefault("PLANNER_API_KEY", "test-planner-key")

from main import app  # noqa: E402
import routers.providers as providers  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    test_client = TestClient(app)
    test_client.headers.update({"X-API-Key": os.environ["PLANNER_API_KEY"]})
    return test_client


def test_venue_endpoint_falls_back_to_all(monkeypatch: pytest.MonkeyPatch, client: TestClient) -> None:
    calls: List[Dict[str, Any]] = []

    def fake_list_venues(*, city: str | None, limit: int) -> List[Dict[str, Any]]:
        calls.append({"city": city, "limit": limit})
        if city == "Nowhere":
            return []
        return [
            {
                "id": "1",
                "name": "Fallback Hall",
                "capacity": 320,
                "avg_cost_lkr": 450_000,
                "standard_rate_lkr": 470_000,
            }
        ]

    monkeypatch.setattr(providers, "list_venues", fake_list_venues)

    response = client.get(
        "/planner/providers/venue",
        params={"city": "Nowhere", "min_capacity": 300, "max_budget_lkr": 500_000, "limit": 5},
    )

    assert response.status_code == 200
    data = response.json()
    assert calls == [{"city": "Nowhere", "limit": 5}, {"city": None, "limit": 5}]
    assert len(data) == 1
    assert data[0]["name"] == "Fallback Hall"
    assert data[0]["capacity"] >= 300
    assert data[0]["avg_cost_lkr"] <= 500_000


def test_music_endpoint_filters_and_fallback(monkeypatch: pytest.MonkeyPatch, client: TestClient) -> None:
    solo_calls: List[str | None] = []
    band_calls: List[str | None] = []

    def fake_list_solo_musicians(*, city: str | None, limit: int) -> List[Dict[str, Any]]:
        solo_calls.append(city)
        if city == "Nowhere":
            return []
        return [
            {
                "id": "solo-1",
                "name": "Fallback Soloist",
                "genres": ["Jazz", "Soul"],
                "standard_rate_lkr": 40_000,
                "experience": "8 years",
            },
            {
                "id": "solo-2",
                "name": "Rock Hero",
                "genres": ["Rock"],
                "standard_rate_lkr": 55_000,
                "experience": "5 years",
            },
        ]

    def fake_list_music_ensembles(*, city: str | None, limit: int) -> List[Dict[str, Any]]:
        band_calls.append(city)
        if city == "Nowhere":
            return []
        return [
            {
                "id": "band-1",
                "name": "Colombo Jazz Collective",
                "genres": ["Jazz", "Funk"],
                "members": 5,
                "standard_rate_lkr": 60_000,
            },
            {
                "id": "band-2",
                "name": "Electric Noise",
                "genres": ["EDM"],
                "members": 3,
                "standard_rate_lkr": 35_000,
            },
        ]

    monkeypatch.setattr(providers, "list_solo_musicians", fake_list_solo_musicians)
    monkeypatch.setattr(providers, "list_music_ensembles", fake_list_music_ensembles)

    response = client.get(
        "/planner/providers/music",
        params={"city": "Nowhere", "genre": "jazz", "max_budget_lkr": 60_000},
    )

    assert response.status_code == 200
    items = response.json()

    # ensure fallbacks were triggered for both solo and band lookups
    assert solo_calls == ["Nowhere", None]
    assert band_calls == ["Nowhere", None]

    # Only the jazz-friendly providers under the budget should remain (one solo, one band)
    assert len(items) == 2
    assert all("Jazz" in "|".join((provider.get("genres") or [])) for provider in items)
    assert {item["provider_type"] for item in items} == {"solo", "band"}
    assert all((item.get("standard_rate_lkr") or 0) <= 60_000 for item in items)


def test_lighting_endpoint_applies_filters(monkeypatch: pytest.MonkeyPatch, client: TestClient) -> None:
    calls: List[str | None] = []

    def fake_list_lighting(*, city: str | None, limit: int) -> List[Dict[str, Any]]:
        calls.append(city)
        return [
            {
                "name": "Bright Spark Lighting",
                "standard_rate_lkr": 28_000,
                "crew_size": 6,
            },
            {
                "name": "Crew Lite",
                "standard_rate_lkr": 22_000,
                "crew_size": 3,
            },
        ]

    monkeypatch.setattr(providers, "list_lighting", fake_list_lighting)

    response = client.get(
        "/planner/providers/lighting",
        params={"city": "Colombo", "max_budget_lkr": 30_000, "min_crew_size": 4},
    )

    assert response.status_code == 200
    results = response.json()
    assert calls == ["Colombo"]
    assert len(results) == 1
    assert results[0]["name"] == "Bright Spark Lighting"
    assert results[0]["standard_rate_lkr"] <= 30_000
    assert results[0]["crew_size"] >= 4


def test_sound_endpoint_fallback_and_filters(monkeypatch: pytest.MonkeyPatch, client: TestClient) -> None:
    calls: List[str | None] = []

    def fake_list_sound_specialists(*, city: str | None, limit: int) -> List[Dict[str, Any]]:
        calls.append(city)
        if city == "Nowhere":
            return []
        return [
            {
                "name": "Audio Masters",
                "standard_rate_lkr": 45_000,
                "crew_size": 5,
            },
            {
                "name": "Compact Audio",
                "standard_rate_lkr": 25_000,
                "crew_size": 2,
            },
        ]

    monkeypatch.setattr(providers, "list_sound_specialists", fake_list_sound_specialists)

    response = client.get(
        "/planner/providers/sound",
        params={"city": "Nowhere", "max_budget_lkr": 50_000, "min_crew_size": 4},
    )

    assert response.status_code == 200
    data = response.json()

    assert calls == ["Nowhere", None]
    assert len(data) == 1
    assert data[0]["name"] == "Audio Masters"
    assert data[0]["standard_rate_lkr"] <= 50_000
    assert data[0]["crew_size"] >= 4
