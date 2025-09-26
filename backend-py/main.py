from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from pydantic import BaseModel
from models.caption_agent import generate_captions
from models.post_agent import share_post
from models.analytics_agent import fetch_post_metrics
from config.scheduler import schedule_job
from db import db

app = FastAPI()

class TopicRequest(BaseModel):
    topic: str

class PostRequest(BaseModel):
    image_url: str
    caption: str

class AnalyticsRequest(BaseModel):
    post_id: str

class EventInput(BaseModel):
    name: str
    date: str
    venue: str
    price: str
    audience: str
    photo_url: str

@app.exception_handler(Exception)
def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )

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
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@app.post("/auto-share")
def auto_share(event: EventInput):
    # Prepare event dict for caption generation
    event_dict = event.dict()
    captions = generate_captions(event_dict)
    caption = captions.get("instagram", "No caption generated.")

    # Share post
    post_result = share_post(event.photo_url, caption)

    # Save to MongoDB
    event_doc = event_dict.copy()
    event_doc["caption"] = caption
    event_doc["post_result"] = post_result
    db["events"].insert_one(event_doc)

    return {
        "caption": caption,
        "post_result": post_result
    }

