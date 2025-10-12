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
from urllib.parse import urlparse

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
    Upload the image to Mastodon media API, then create a status with media_ids so
    the photo is displayed without including the raw image URL in the status text.
    """
    if DEMO_MODE:
        time.sleep(0.2)
        return {"status": "ok", "demo": True, "target": "mastodon", "posted_with_media": True}

    if not (MASTODON_BASE_URL and MASTODON_ACCESS_TOKEN):
        raise ValueError("Missing MASTODON_BASE_URL or MASTODON_ACCESS_TOKEN")

    base = MASTODON_BASE_URL.rstrip('/')
    headers = {"Authorization": f"Bearer {MASTODON_ACCESS_TOKEN}"}

    # 1) Obtain image bytes from either a remote URL or a local file path
    is_web_url = str(image_url).strip().lower().startswith(("http://", "https://"))
    if is_web_url:
        img_res = requests.get(image_url, timeout=15)
        img_res.raise_for_status()
        content = img_res.content
        parsed = urlparse(image_url)
        filename = os.path.basename(parsed.path) or "image.jpg"
        ctype = img_res.headers.get("content-type") or mimetypes.guess_type(filename)[0] or "image/jpeg"
    else:
        # Support Windows-style local paths or file:// URIs for local demo
        local_path = str(image_url)
        if local_path.lower().startswith("file://"):
            # Strip file:// prefix
            local_path = local_path[7:]
        local_path = os.path.normpath(local_path)
        if not os.path.isabs(local_path):
            # Resolve relative to current working dir
            local_path = os.path.abspath(local_path)
        if not os.path.exists(local_path):
            raise ValueError(f"Local image file not found: {local_path}")
        with open(local_path, "rb") as f:
            content = f.read()
        filename = os.path.basename(local_path) or "image.jpg"
        ctype = mimetypes.guess_type(filename)[0] or "image/jpeg"

    files = {"file": (filename, content, ctype)}

    # 2) Upload media (try v2, fallback to v1 for compatibility)
    media_id = None
    media_error = None
    media_auth_unauthorized = False
    for media_endpoint in ("/api/v2/media", "/api/v1/media"):
        media_url = f"{base}{media_endpoint}"
        media_res = requests.post(media_url, headers=headers, files=files, data={"description": caption[:420]})
        if media_res.ok:
            media_id = media_res.json().get("id")
            break
        else:
            try:
                media_error = media_res.json()
            except Exception:
                media_error = {"status_code": media_res.status_code, "text": media_res.text}
            if media_res.status_code == 401:
                # Token likely missing write:media or instance mismatch. Try status-only fallback.
                media_auth_unauthorized = True
                break
    if not media_id:
        # Post caption-only (no path/URL) and surface the upload error in response for quick fixes
        status_url = f"{base}/api/v1/statuses"
        res = requests.post(status_url, headers=headers, data={"status": caption})
        if res.ok:
            warning = "media_upload_unauthorized" if media_auth_unauthorized else "media_upload_failed"
            return {"warning": warning, "media_error": media_error, **res.json()}
        # Status-only also failed — raise a targeted error if we previously saw 401 on media
        if media_auth_unauthorized and res.status_code == 401:
            raise requests.HTTPError(
                "Mastodon auth failed (401) for both media upload and status post. Ensure token is for the same instance and includes write:statuses and write:media.",
                response=res,
            )
        # Otherwise bubble up the status error
        res.raise_for_status()
        return res.json()

    # 3) Create status with attached media
    status_url = f"{base}/api/v1/statuses"
    # Encode media_ids[] as repeated field for compatibility
    data = [("status", caption), ("media_ids[]", media_id)]
    res = requests.post(status_url, headers=headers, data=data)
    res.raise_for_status()
    return res.json()


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
