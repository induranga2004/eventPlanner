import importlib

import pytest

from utils import concept_repository as repo
from agents.concept_generator import ConceptGenerationQuotaExceeded, ConceptGenerationUnavailable


@pytest.fixture(autouse=True)
def reload_repo():
    """Ensure the repository module sees fresh environment state per test."""
    importlib.reload(repo)
    yield
    importlib.reload(repo)


@pytest.fixture
def provider_snapshot(monkeypatch):
    snapshot = {
        "venues": [
            {"name": "City Hall", "avg_cost_lkr": 500_000, "city": "Colombo"},
        ],
        "solo_musicians": [
            {"name": "Aisha", "standard_rate_lkr": 150_000},
        ],
        "music_ensembles": [
            {"name": "The Ensemble", "standard_rate_lkr": 320_000},
        ],
        "lighting_designers": [
            {"name": "Glow Lights", "standard_rate_lkr": 140_000},
        ],
        "sound_specialists": [
            {"name": "SoundLab", "standard_rate_lkr": 110_000},
        ],
    }
    monkeypatch.setattr(repo, "_provider_snapshot", lambda city=None, limit=6: snapshot)
    return snapshot


def test_list_concepts_uses_provider_fallback_when_ai_disabled(monkeypatch, provider_snapshot):
    monkeypatch.setenv("USE_AI_CONCEPTS", "0")
    concepts = repo.list_concepts(limit=1)
    assert concepts, "Expected fallback concept from provider data"
    concept = concepts[0]
    assert concept.concept_id
    assert concept.title
    assert "music" in concept.cost_split
    assert concept.providers["music"][0] == "Aisha"


def test_list_concepts_falls_back_when_ai_unavailable(monkeypatch, provider_snapshot):
    monkeypatch.setenv("USE_AI_CONCEPTS", "1")

    def fake_seed(context=None):
        raise ConceptGenerationUnavailable("AI disabled for test")

    monkeypatch.setattr(repo, "_seed_via_ai", fake_seed)

    concepts = repo.list_concepts(limit=1)
    assert concepts, "Fallback should produce concept even when AI unavailable"
    assert all(concept.title for concept in concepts)


def test_quota_exhaustion_disables_ai(monkeypatch, provider_snapshot):
    monkeypatch.setenv("USE_AI_CONCEPTS", "1")

    def quota_error(context=None):
        raise ConceptGenerationQuotaExceeded("OpenAI quota exhausted; using provider fallback.")

    monkeypatch.setattr(repo, "_seed_via_ai", quota_error)

    concepts = repo.list_concepts(limit=1)
    assert concepts, "Quota exhaustion should fall back to provider concept"
    assert repo.concept_notice() is not None

    calls = {"count": 0}

    def unexpected_call(context=None):
        calls["count"] += 1
        raise AssertionError("AI generation should remain disabled once quota exhausted")

    monkeypatch.setattr(repo, "_seed_via_ai", unexpected_call)
    repo.list_concepts(limit=1)
    assert calls["count"] == 0
