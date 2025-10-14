"""Utility script to remove legacy planner rows with outdated cost categories.

Run this after refactoring the planner cost split to venue/music/lighting/sound.
The script deletes any stored event plans that still reference the older
categories (catering, logistics, etc.) so that the frontend no longer shows
stale budget lines.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ALLOWED_CATEGORIES = {"venue", "music", "lighting", "sound"}
DB_PATH = Path(__file__).resolve().parent.parent / "planner.db"


def _connect() -> sqlite3.Connection:
    if not DB_PATH.exists():
        raise SystemExit(f"planner.db not found at {DB_PATH}")
    return sqlite3.connect(str(DB_PATH))


def _plans_with_legacy_categories(cur: sqlite3.Cursor) -> list[tuple[str, set[str]]]:
    query = """
        SELECT ep.id, GROUP_CONCAT(DISTINCT pc.category)
        FROM event_plans AS ep
        JOIN plan_costs AS pc ON pc.event_plan_id = ep.id
        GROUP BY ep.id
    """
    legacy: list[tuple[str, set[str]]] = []
    for plan_id, categories in cur.execute(query):
        cats = {c.strip() for c in (categories or "").split(",") if c}
        if not cats:
            continue
        if not cats <= ALLOWED_CATEGORIES:
            legacy.append((plan_id, cats))
    return legacy


def _delete_plan(conn: sqlite3.Connection, plan_id: str) -> None:
    cur = conn.cursor()
    cur.execute("DELETE FROM plan_costs WHERE event_plan_id = ?", (plan_id,))
    cur.execute("DELETE FROM plan_timeline WHERE event_plan_id = ?", (plan_id,))
    cur.execute("DELETE FROM selected_plans WHERE event_plan_id = ?", (plan_id,))
    cur.execute("DELETE FROM event_plans WHERE id = ?", (plan_id,))
    conn.commit()


if __name__ == "__main__":
    conn = _connect()
    cur = conn.cursor()

    legacy_plans = _plans_with_legacy_categories(cur)
    if not legacy_plans:
        print("No legacy plans found; nothing to clean up.")
    else:
        print(f"Found {len(legacy_plans)} legacy plans with outdated categories.")
        removed = 0
        for plan_id, categories in legacy_plans:
            print(f" - Removing plan {plan_id} with categories: {sorted(categories)}")
            _delete_plan(conn, plan_id)
            removed += 1
        print(f"Removed {removed} event plans. Remaining plans now use {sorted(ALLOWED_CATEGORIES)}")

    conn.close()
