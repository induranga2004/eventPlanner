import os, io, json
import cloudinary
import cloudinary.uploader as uploader

def init_cloudinary():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True
    )

def public_id(campaign_id: str, render_id: str, name: str) -> str:
    return f"renders/{campaign_id}/{render_id}/{name}"

def upload_image_bytes(content: bytes, public_id_str: str, fmt="png") -> str:
    res = uploader.upload(
        io.BytesIO(content),
        public_id=public_id_str,
        resource_type="image",
        overwrite=True,
        format=fmt
    )
    return res["secure_url"]

def save_manifest(campaign_id: str, render_id: str, manifest: dict) -> str:
    pid = public_id(campaign_id, render_id, "manifest")
    res = uploader.upload_large(
        io.BytesIO(json.dumps(manifest).encode("utf-8")),
        public_id=pid,
        resource_type="raw",
        overwrite=True,
        format="json"
    )
    return res["secure_url"]
