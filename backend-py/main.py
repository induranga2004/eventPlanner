from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from pydantic import BaseModel, Field, ConfigDict
from models.caption_agent import generate_captions
from models.post_agent import share_post
from models.analytics_agent import fetch_post_metrics
from config.scheduler import schedule_job
from config.config import MASTODON_BASE_URL, MASTODON_ACCESS_TOKEN
import requests


app = FastAPI()

class TopicRequest(BaseModel):
    topic: str

class PostRequest(BaseModel):
    image_url: str
    caption: str

class AnalyticsRequest(BaseModel):
    post_id: str

class AutoShareInput(BaseModel):
    # Accept both snake_case and camelCase (photo_url / photoUrl)
    model_config = ConfigDict(populate_by_name=True)
    name: str
    date: str
    venue: str
    price: str
    audience: str
    photo_url: str = Field(alias="photoUrl")



@app.get("/")
def read_root():
    return {"status": "API is running"}

@app.post("/generate-content")
def generate_content(request: TopicRequest):
    try: 
        event = {
            "name": request.topic,
            "date": "2025-12-10",
            "venue": "Colombo Stadium",
            "price": "2000 LKR",
            "audience": "18-30 music lovers"
        }
        result = generate_captions(event)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/share-post")
def share_post_api(request: PostRequest):
    try:
        result = share_post(request.image_url, request.caption)
        return {"result": result}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/analytics")
def analytics_api(request: AnalyticsRequest):
    try:
        result = fetch_post_metrics(request.post_id)
        return {"result": result}
    except Exception as e:        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/auto-share")
def auto_share(input: AutoShareInput):
    try:
        event = {
            "name": input.name,
            "date": input.date,
            "venue": input.venue,
            "price": input.price,
            "audience": input.audience,
        }
        captions = generate_captions(event)
        caption = captions.get("instagram", "Enjoy the event!")
        result = share_post(input.photo_url, caption)
        return {"caption": caption, "post_result": result}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.get("/mastodon/verify")
def mastodon_verify():
    try:
        base = (MASTODON_BASE_URL or "").strip().rstrip('/')
        token = (MASTODON_ACCESS_TOKEN or "").strip()
        if not base or not token:
            return JSONResponse(status_code=400, content={"error": "Missing MASTODON_BASE_URL or MASTODON_ACCESS_TOKEN"})
        url = f"{base}/api/v1/accounts/verify_credentials"
        resp = requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=15)
        if not resp.ok:
            return JSONResponse(status_code=resp.status_code, content={"error": resp.text})
        data = resp.json()
        return {"ok": True, "instance": base, "account": {"id": data.get("id"), "username": data.get("username"), "acct": data.get("acct")}}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
