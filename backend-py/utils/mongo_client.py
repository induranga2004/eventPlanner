import logging
import os
from functools import lru_cache
from typing import Any

try:
    from pymongo import MongoClient
    from pymongo.collection import Collection
    from pymongo.database import Database
    from pymongo.errors import ConfigurationError, PyMongoError
except Exception:  # pragma: no cover - pymongo optional during tests
    MongoClient = None  # type: ignore
    Collection = Any  # type: ignore
    Database = Any  # type: ignore

    class ConfigurationError(Exception):
        ...

    class PyMongoError(Exception):
        ...

logger = logging.getLogger(__name__)


class MongoUnavailable(RuntimeError):
    """Raised when MongoDB is not configured or dependencies are missing."""


def _require_client() -> Any:
    if MongoClient is None:
        raise MongoUnavailable(
            "pymongo is not installed. Add it to requirements to enable Mongo-backed data."
        )
    uri = os.getenv("MONGO_URI")
    if not uri:
        raise MongoUnavailable("MONGO_URI environment variable is not set.")

    timeout_ms = int(os.getenv("MONGO_TIMEOUT_MS", "5000"))
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=timeout_ms)
        return client
    except ConfigurationError as exc:
        raise MongoUnavailable(f"Invalid MONGO_URI configuration: {exc}") from exc


@lru_cache(maxsize=1)
def _cached_client() -> Any:
    client = _require_client()
    return client


def get_client() -> Any:
    """Return a cached MongoClient instance."""
    return _cached_client()


def _resolve_database(client: Any) -> Any:
    db_name = os.getenv("MONGO_DB_NAME")
    if db_name:
        return client[db_name]

    try:
        default_db = client.get_default_database()
        if default_db is not None:
            return default_db
    except PyMongoError as exc:
        raise MongoUnavailable(f"Unable to determine default Mongo database: {exc}") from exc

    raise MongoUnavailable(
        "Mongo database name is unknown. Set MONGO_DB_NAME or include it in MONGO_URI."
    )


def get_database() -> Any:
    """Return the configured Mongo database handle."""
    client = get_client()
    return _resolve_database(client)


def get_collection(name: str) -> Any:
    db = get_database()
    return db[name]


def get_users_collection() -> Any:
    collection_name = os.getenv("MONGO_USERS_COLLECTION", "users")
    return get_collection(collection_name)


def mongo_available() -> bool:
    try:
        get_client()
        return True
    except MongoUnavailable as exc:  # pragma: no cover - simple probe
        logger.debug("Mongo unavailable: %s", exc)
        return False
