import os
from pathlib import Path
from typing import Iterable

from dotenv import load_dotenv


def _candidate_env_paths() -> Iterable[Path]:
    settings_path = Path(__file__).resolve()
    repo_root = settings_path.parents[2] if len(settings_path.parents) >= 3 else settings_path.parent
    backend_py_dir = repo_root / "backend-py"
    return (
        repo_root / ".env",
        backend_py_dir / ".env",
        repo_root / "backend-node" / ".env",
    )


def load_environment() -> None:
    """Load environment variables from known locations without overriding existing values."""

    loaded = False
    for env_path in _candidate_env_paths():
        if env_path.is_file():
            # override=False keeps process-level values intact if already provided
            load_dotenv(dotenv_path=env_path, override=False)
            loaded = True

    if not loaded:
        # Fallback to default dotenv discovery so we do not regress prior behaviour
        load_dotenv(override=False)


# Trigger env loading on import so downstream modules see the configuration.
load_environment()

class Config:
    # Example configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    # Add other configurations as needed
