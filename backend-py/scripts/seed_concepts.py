from __future__ import annotations

import argparse
import logging
from typing import Any, Dict

from dotenv import load_dotenv

from utils.concept_repository import ensure_seed_concept, list_concepts

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_concepts")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed AI-generated concepts into MongoDB.")
    parser.add_argument("--concept-id", help="Preferred concept_id identifier", default="ai_concept_001")
    parser.add_argument("--audience", help="Audience descriptor", default="urban concert lovers")
    parser.add_argument("--attendees", type=int, help="Expected attendee count", default=200)
    parser.add_argument("--budget", type=int, help="Total budget in LKR", default=2_000_000)
    parser.add_argument("--vibe", help="Event vibe or theme", default="high-energy musical night")
    return parser.parse_args()


def main() -> None:
    load_dotenv()
    args = _parse_args()

    context: Dict[str, Any] = {
        "concept_id": args.concept_id,
        "audience": args.audience,
        "attendees": args.attendees,
        "budget_lkr": args.budget,
        "vibe": args.vibe,
    }

    ensure_seed_concept(context=context)
    concepts = list_concepts(limit=5)

    logger.info("Seeded concepts (top %s):", len(concepts))
    for concept in concepts:
        logger.info("- %s :: %s", concept.concept_id, concept.title)

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # pragma: no cover
        logger.error("Seeding failed: %s", exc)
        raise
