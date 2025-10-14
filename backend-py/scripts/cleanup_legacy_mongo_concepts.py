"""Remove concepts from Mongo that still use legacy cost categories.

This script connects to the Mongo 'concepts' collection (from environment)
and deletes any concept documents whose cost_split contains keys other than
venue/music/lighting/sound. Run this after updating the concept generation
prompt to ensure only new-format concepts are served.
"""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

# Add parent to sys.path so we can import utils
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from utils.mongo_client import get_collection, mongo_available

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

ALLOWED_COST_KEYS = {"venue", "music", "lighting", "sound"}
COLLECTION_ENV = "MONGO_CONCEPTS_COLLECTION"
DEFAULT_COLLECTION = "concepts"


def main() -> None:
    if not mongo_available():
        logger.error("Mongo not available. Ensure MONGO_URI is set.")
        sys.exit(1)

    collection_name = os.getenv(COLLECTION_ENV, DEFAULT_COLLECTION)
    collection = get_collection(collection_name)

    logger.info(f"Checking {collection_name} for legacy cost categories...")

    # Find concepts with cost_split keys not in allowed set
    legacy_concepts = []
    for doc in collection.find():
        cost_split = doc.get("cost_split") or {}
        if not isinstance(cost_split, dict):
            continue
        categories = set(cost_split.keys())
        if not categories <= ALLOWED_COST_KEYS:
            legacy_concepts.append((doc.get("_id"), doc.get("concept_id"), categories))

    if not legacy_concepts:
        logger.info("✓ No legacy concepts found; collection is clean.")
        return

    logger.info(f"Found {len(legacy_concepts)} concepts with outdated categories:")
    for mongo_id, concept_id, categories in legacy_concepts:
        logger.info(f"  - {concept_id or mongo_id}: {sorted(categories)}")

    proceed = input("\nDelete these concepts? (y/N): ").strip().lower()
    if proceed not in {"y", "yes"}:
        logger.info("Aborted.")
        return

    deleted = 0
    for mongo_id, concept_id, _ in legacy_concepts:
        result = collection.delete_one({"_id": mongo_id})
        if result.deleted_count > 0:
            deleted += 1

    logger.info(f"✓ Removed {deleted} legacy concepts from {collection_name}.")
    logger.info(f"  Remaining concepts now use only {sorted(ALLOWED_COST_KEYS)}.")


if __name__ == "__main__":
    main()
