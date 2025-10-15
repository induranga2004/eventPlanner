"""Integration test covering planner pipeline through design background generation."""

from __future__ import annotations

import json
import os
import pathlib
import sys
from typing import Dict, Any

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from sqlalchemy import text

BACKEND_ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Ensure planner API key is available before importing the app
os.environ.setdefault("PLANNER_API_KEY", "test-planner-key")

from main import app  # noqa: E402
from config.database import SessionLocal  # noqa: E402
from services.concept_naming import ConceptIdentity  # noqa: E402

CLIENT_HEADERS = {"X-API-Key": os.environ["PLANNER_API_KEY"]}


@pytest.fixture
def client() -> TestClient:
    test_client = TestClient(app)
    test_client.headers.update(CLIENT_HEADERS)
    return test_client


def _save_context(client: TestClient, payload: Dict[str, Any]) -> None:
    response = client.post("/api/event-context/save", json=payload)
    assert response.status_code == 200, response.text


def _cleanup_campaign(campaign_id: str) -> None:
    with SessionLocal() as session:
        session.execute(text("DELETE FROM plan_timeline WHERE event_plan_id IN (SELECT id FROM event_plans WHERE campaign_id = :cid)"), {"cid": campaign_id})
        session.execute(text("DELETE FROM plan_costs WHERE event_plan_id IN (SELECT id FROM event_plans WHERE campaign_id = :cid)"), {"cid": campaign_id})
        session.execute(text("DELETE FROM event_plans WHERE campaign_id = :cid"), {"cid": campaign_id})
        session.execute(text("DELETE FROM event_contexts WHERE campaign_id = :cid"), {"cid": campaign_id})
        session.execute(text("DELETE FROM campaigns WHERE id = :cid"), {"cid": campaign_id})
        session.commit()


def test_planner_flow_generates_design_background(client: TestClient) -> None:
    response = client.post("/campaigns", json={"name": "QA Flow Campaign"})
    assert response.status_code == 200, response.text
    campaign_id = response.json()["id"]

    context_payload = {
        "campaign_id": campaign_id,
        "event_name": "Electric Harbour Showcase",
        "venue": "Harbourfront Arena, Colombo",
        "event_date": "2025-11-12",
        "attendees_estimate": 180,
        "total_budget_lkr": 1_800_000,
        "number_of_concepts": 2,
        "selections": {},
        "metadata": {"vibe": "energetic", "palette": ["#FF0080", "#00FFFF"]},
    }
    _save_context(client, context_payload)

    planner_body = {
        "campaign_id": campaign_id,
        "event_name": context_payload["event_name"],
        "venue": context_payload["venue"],
        "event_date": context_payload["event_date"],
        "attendees_estimate": context_payload["attendees_estimate"],
        "total_budget_lkr": context_payload["total_budget_lkr"],
        "number_of_concepts": context_payload["number_of_concepts"],
    }
    with patch("routers.planner.generate_concept_identity", return_value=ConceptIdentity(
        title="Neon Skyline Sessions",
        tagline="Colombo's waterfront comes alive with electric grooves",
        source="test",
    )):
        response = client.post(f"/campaigns/{campaign_id}/planner/generate", json=planner_body)
    assert response.status_code == 200, response.text
    plan_data = response.json()
    assert plan_data["concepts"], "Planner should return at least one concept"

    selected_concept = plan_data["concepts"][0]
    context_payload["selectedConcept"] = selected_concept
    _save_context(client, context_payload)

    fake_response = MagicMock()
    fake_choice = MagicMock()
    fake_choice.message.content = json.dumps({
        "title": "Neon Skyline Sessions",
        "tagline": "Colombo's waterfront comes alive with electric grooves",
    })
    fake_response.choices = [fake_choice]
    fake_client = MagicMock()
    fake_client.chat.completions.create.return_value = fake_response

    with patch("routers.concept_names._get_openai_client", return_value=fake_client):
        response = client.post(
            "/planner/regenerate-name",
            json={"city": "Colombo", "vibe": "energetic", "audience": "music fans"},
        )
    assert response.status_code == 200, response.text
    name_payload = response.json()
    assert name_payload["title"].startswith("Neon")

    design_payload = {
        "campaign_id": campaign_id,
        "event": {
            "title": context_payload["event_name"],
            "city": "Colombo",
            "date": context_payload["event_date"],
            "audience": "music fans",
            "genre": "electronic",
        },
        "artists": [],
        "style_prefs": {
            "mood": "neon",
            "palette": ["#FF0080", "#00FFFF"],
            "sizes": ["square"],
        },
    }
    response = client.post("/api/design/start", json=design_payload)
    assert response.status_code == 200, response.text
    design_data = response.json()
    assert design_data["variants"], "Design endpoint should produce variants"
    bg_url = design_data["variants"][0]["layers"]["l1_background_url"]
    assert bg_url, "Background URL should be present"

    response = client.post(
        "/api/design/generate-backgrounds",
        json={"campaign_id": campaign_id, "count": 1, "size": "square"},
    )
    assert response.status_code == 200, response.text
    bg_data = response.json()
    assert bg_data["prompt"], "Background prompt should be generated"
    assert bg_data["bg_options"], "Should return at least one background option"

    _cleanup_campaign(campaign_id)