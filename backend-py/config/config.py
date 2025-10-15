import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def _clean(val: str | None) -> str | None:
	if val is None:
		return None
	v = val.strip()
	# remove surrounding quotes if present
	if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
		v = v[1:-1].strip()
	return v

# Config variables
OPENAI_API_KEY = _clean(os.getenv("OPENAI_API_KEY"))

# Share target: instagram | mastodon | discord
SHARE_TARGET = _clean(os.getenv("SHARE_TARGET") or "instagram").lower()

# Instagram (Meta)
IG_ACCESS_TOKEN = _clean(os.getenv("IG_ACCESS_TOKEN"))
IG_USER_ID = _clean(os.getenv("IG_USER_ID"))

# Mastodon (open source)
MASTODON_BASE_URL = _clean(os.getenv("MASTODON_BASE_URL"))  # e.g., https://mastodon.social
MASTODON_ACCESS_TOKEN = _clean(os.getenv("MASTODON_ACCESS_TOKEN"))

# Discord webhook (simple demo-friendly)
DISCORD_WEBHOOK_URL = _clean(os.getenv("DISCORD_WEBHOOK_URL"))

# Demo mode: when true, bypass external APIs and return simulated responses
DEMO_MODE = str(os.getenv("DEMO_MODE", "")).strip().lower() in {"1", "true", "yes", "on"}

# Optional local override for demos/vivas:
# Create a file at backend-py/config/secrets_override.py with constants
# OPENAI_API_KEY, IG_ACCESS_TOKEN, IG_USER_ID to override env values.
try:
	# Prefer getattr to avoid AttributeError if any constant is missing
	from config import secrets_override as _secrets
	OPENAI_API_KEY = getattr(_secrets, "OPENAI_API_KEY", OPENAI_API_KEY) or OPENAI_API_KEY
	SHARE_TARGET = getattr(_secrets, "SHARE_TARGET", SHARE_TARGET)
	IG_ACCESS_TOKEN = getattr(_secrets, "IG_ACCESS_TOKEN", IG_ACCESS_TOKEN) or IG_ACCESS_TOKEN
	IG_USER_ID = getattr(_secrets, "IG_USER_ID", IG_USER_ID) or IG_USER_ID
	MASTODON_BASE_URL = getattr(_secrets, "MASTODON_BASE_URL", MASTODON_BASE_URL) or MASTODON_BASE_URL
	MASTODON_ACCESS_TOKEN = getattr(_secrets, "MASTODON_ACCESS_TOKEN", MASTODON_ACCESS_TOKEN) or MASTODON_ACCESS_TOKEN
	DISCORD_WEBHOOK_URL = getattr(_secrets, "DISCORD_WEBHOOK_URL", DISCORD_WEBHOOK_URL) or DISCORD_WEBHOOK_URL
	DEMO_MODE = getattr(_secrets, "DEMO_MODE", DEMO_MODE)
except Exception:
	# No override file present or import failed; ignore silently
	pass

