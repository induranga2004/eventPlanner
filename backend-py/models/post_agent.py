import time
import requests
from config.config import (
    IG_ACCESS_TOKEN,
    IG_USER_ID,
    DEMO_MODE,
    SHARE_TARGET,
    MASTODON_BASE_URL,
    MASTODON_ACCESS_TOKEN,
    DISCORD_WEBHOOK_URL,
)
import os
import mimetypes
import tempfile
import logging
from urllib.parse import urlparse

# Try to import Mastodon.py library
try:
    from mastodon import Mastodon
    MASTODON_PY_AVAILABLE = True
except ImportError:
    MASTODON_PY_AVAILABLE = False
    logging.warning("Mastodon.py not installed. Install with: pip install Mastodon.py")

logger = logging.getLogger(__name__)

def _share_instagram(image_url, caption):
    if DEMO_MODE:
        # Simulate network delay and a deterministic publish response
        time.sleep(0.2)
        return {
            "id": "17890000000000000",
            "status": "ok",
            "demo": True,
            "image_url": image_url,
            "caption": caption
        }
    create_url = f"https://graph.facebook.com/v23.0/{IG_USER_ID}/media"
    payload = {"image_url": image_url, "caption": caption, "access_token": IG_ACCESS_TOKEN}
    res = requests.post(create_url, data=payload)
    res.raise_for_status()
    creation_id = res.json().get("id")

    publish_url = f"https://graph.facebook.com/v23.0/{IG_USER_ID}/media_publish"
    publish_res = requests.post(publish_url, data={
        "creation_id": creation_id,
        "access_token": IG_ACCESS_TOKEN
    })
    publish_res.raise_for_status()
    return publish_res.json()


def _share_mastodon(image_url, caption):
    """
    Upload the image to Mastodon using the official Mastodon.py library.
    Downloads the image from URL (or reads local file), then uploads and posts.
    """
    if DEMO_MODE:
        time.sleep(0.2)
        return {"status": "ok", "demo": True, "target": "mastodon", "posted_with_media": True}

    if not (MASTODON_BASE_URL and MASTODON_ACCESS_TOKEN):
        raise ValueError("Missing MASTODON_BASE_URL or MASTODON_ACCESS_TOKEN in .env")

    if not MASTODON_PY_AVAILABLE:
        raise ImportError("Mastodon.py library not installed. Run: pip install Mastodon.py")

    # Initialize Mastodon client
    mastodon = Mastodon(
        access_token=MASTODON_ACCESS_TOKEN,
        api_base_url=MASTODON_BASE_URL.rstrip('/')
    )

    # Download image to temporary file
    temp_file = None
    try:
        is_web_url = str(image_url).strip().lower().startswith(("http://", "https://"))
        
        if is_web_url:
            logger.info(f"Downloading image from URL: {image_url}")
            img_res = requests.get(image_url, timeout=30)
            img_res.raise_for_status()
            content = img_res.content
            logger.info(f"Downloaded {len(content)} bytes")
            
            # Determine file extension from URL or content-type
            parsed = urlparse(image_url)
            filename = os.path.basename(parsed.path) or "image.jpg"
            ext = os.path.splitext(filename)[1] or ".jpg"
            
            # Save to temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
            temp_file.write(content)
            temp_file.close()
            image_path = temp_file.name
            logger.info(f"Saved to temporary file: {image_path}")
        else:
            # Local file path
            local_path = str(image_url)
            if local_path.lower().startswith("file://"):
                local_path = local_path[7:]
            local_path = os.path.normpath(local_path)
            if not os.path.isabs(local_path):
                local_path = os.path.abspath(local_path)
            if not os.path.exists(local_path):
                raise ValueError(f"Local image file not found: {local_path}")
            image_path = local_path
            logger.info(f"Using local file: {image_path}")

        # Upload media to Mastodon
        logger.info("Uploading media to Mastodon...")
        media = mastodon.media_post(image_path, description=caption[:420])
        logger.info(f"Media uploaded successfully, ID: {media['id']}")

        # Post status with media
        logger.info("Posting status with media...")
        status = mastodon.status_post(caption, media_ids=[media])
        logger.info(f"Status posted successfully, ID: {status['id']}")

        return {
            "status": "ok",
            "target": "mastodon",
            "media_id": media['id'],
            "status_id": status['id'],
            "url": status.get('url', ''),
            "posted_with_media": True
        }

    except Exception as e:
        logger.error(f"Mastodon share error: {str(e)}")
        raise
    
    finally:
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file.name):
            try:
                os.unlink(temp_file.name)
                logger.info("Cleaned up temporary file")
            except Exception as e:
                logger.warning(f"Failed to delete temp file: {e}")


def _share_discord(image_url, caption):
    # Discord webhook is easy to set up and demo; sends content + image embed.
    if DEMO_MODE:
        time.sleep(0.2)
        return {"status": "ok", "demo": True, "target": "discord", "content": caption, "image_url": image_url}
    if not DISCORD_WEBHOOK_URL:
        raise ValueError("Missing DISCORD_WEBHOOK_URL")
    payload = {
        "content": caption,
        "embeds": [
            {"image": {"url": image_url}}
        ],
    }
    res = requests.post(DISCORD_WEBHOOK_URL, json=payload)
    res.raise_for_status()
    return {"status": "ok"}


def share_post(image_url, caption):
    target = (SHARE_TARGET or "instagram").lower()
    if target == "mastodon":
        return _share_mastodon(image_url, caption)
    if target == "discord":
        return _share_discord(image_url, caption)
    # default
    return _share_instagram(image_url, caption)
