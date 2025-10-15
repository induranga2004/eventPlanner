import os, io, json
from pathlib import Path
import cloudinary
import cloudinary.uploader as uploader

_USE_CLOUDINARY = False
_LOCAL_RENDER_DIR = Path(os.getenv("LOCAL_RENDER_DIR", "./tmp_design_renders")).resolve()

def init_cloudinary():
    global _USE_CLOUDINARY
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")

    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True
        )
        _USE_CLOUDINARY = True
    else:
        _USE_CLOUDINARY = False
        _LOCAL_RENDER_DIR.mkdir(parents=True, exist_ok=True)

def public_id(campaign_id: str, render_id: str, name: str) -> str:
    return f"renders/{campaign_id}/{render_id}/{name}"

def upload_image_bytes(content: bytes, public_id_str: str, fmt="png") -> str:
    if not _USE_CLOUDINARY:
        path = _LOCAL_RENDER_DIR / f"{public_id_str.replace('/', '_')}.{fmt}"
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as fp:
            fp.write(content)
        return path.as_posix()

    res = uploader.upload(
        io.BytesIO(content),
        public_id=public_id_str,
        resource_type="image",
        overwrite=True,
        format=fmt
    )
    return res["secure_url"]

def save_manifest(campaign_id: str, render_id: str, manifest: dict) -> str:
    if not _USE_CLOUDINARY:
        path = _LOCAL_RENDER_DIR / f"{public_id(campaign_id, render_id, 'manifest').replace('/', '_')}.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as fp:
            json.dump(manifest, fp)
        return path.as_posix()

    pid = public_id(campaign_id, render_id, "manifest")
    res = uploader.upload_large(
        io.BytesIO(json.dumps(manifest).encode("utf-8")),
        public_id=pid,
        resource_type="raw",
        overwrite=True,
        format="json"
    )
    return res["secure_url"]
