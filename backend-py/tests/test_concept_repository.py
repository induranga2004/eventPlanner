import importlib

import pytest

from utils import concept_repository as repo
from agents.concept_generator import ConceptGenerationUnavailable


@pytest.fixture(autouse=True)
def reload_repo():
    """Ensure the repository module sees fresh environment state per test."""
    importlib.reload(repo)
    yield
    importlib.reload(repo)


def test_list_concepts_uses_csv_when_ai_disabled(monkeypatch):
    monkeypatch.setenv("USE_AI_CONCEPTS", "0")
    concepts = repo.list_concepts(limit=1)
    assert concepts, "Expected at least one concept from CSV fallback"
    concept = concepts[0]
    assert concept.concept_id
    assert concept.title


def test_list_concepts_falls_back_when_ai_unavailable(monkeypatch):
    monkeypatch.setenv("USE_AI_CONCEPTS", "1")

    def fake_seed(context=None):
        raise ConceptGenerationUnavailable("AI disabled for test")

    monkeypatch.setattr(repo, "_seed_via_ai", fake_seed)

    concepts = repo.list_concepts(limit=1)
    assert concepts, "Fallback to CSV should produce concepts"
    assert all(concept.title for concept in concepts)
