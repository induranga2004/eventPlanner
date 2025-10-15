import logging
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
import requests

# --- Project imports (package-style) ---
from config.database import engine, get_db, Base
from config.settings import load_environment
from models.campaign import Campaign
from models.event_context import EventContextRecord
from routers.planner import router as planner_router
from routers.venues import router as venues_router
from routers.concept_names import router as concept_names_router
from routers.providers import router as providers_router

# --- Social Sharing imports ---
try:
    from models.caption_agent import generate_captions
    from models.post_agent import share_post
    from models.analytics_agent import fetch_post_metrics
    from config.scheduler import schedule_job
    from config.config import MASTODON_BASE_URL, MASTODON_ACCESS_TOKEN
    SOCIAL_SHARING_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Social sharing features not available: {e}")
    SOCIAL_SHARING_AVAILABLE = False

logger = logging.getLogger(__name__)

# Load environment variables
load_environment()

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    logger.warning(
        "OPENAI_API_KEY not found; AI-powered enhancements will rely on Mongo provider data only."
    )

_BOOL_TRUE = {"1", "true", "yes", "on"}
CREW_AI_ENABLED = os.getenv("ENABLE_CREW_AI", "0").strip().lower() in _BOOL_TRUE

# Check for Cloudinary configuration (for AI visual composer features)
AI_ENABLE_FLUX = os.getenv("AI_ENABLE_FLUX", "false").lower() == "true"
CLOUDINARY_READY = all([
    os.getenv("CLOUDINARY_CLOUD_NAME"),
    os.getenv("CLOUDINARY_API_KEY"),
    os.getenv("CLOUDINARY_API_SECRET"),
])
if not CLOUDINARY_READY:
    logger.warning("Cloudinary not fully configured. AI visual features disabled. Set CLOUDINARY_* in .env.")

app = FastAPI(
    title="Event Planner API with AI Visual Composer & Social Sharing",
    description="Musical event planner with budgets, venues, catering, AI-powered visual design tools, and social media integration.",
    version="2.1.0"
)

# --- CORS ---
default_origins = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173"
origins_str = os.getenv("CORS_ORIGIN", default_origins)
origins = [o.strip() for o in origins_str.split(",") if o.strip()]
origins.append("*")  # Allow all for development

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database initialization ---
Base.metadata.create_all(bind=engine)

# --- Mount Existing Event Planner Routers ---
app.include_router(planner_router)
app.include_router(venues_router)
app.include_router(concept_names_router)
app.include_router(providers_router)

# --- Mount New AI Visual Composer Routers ---
try:
    from routers.design import router as design_router
    app.include_router(design_router, prefix="/api/design", tags=["design"])
    logger.info("Mounted /api/design router (AI Visual Composer).")
except Exception as e:
    logger.warning(f"/api/design router not mounted: {e}")

if CREW_AI_ENABLED:
    try:
        from routers.intelligence import router as intelligence_router
        app.include_router(intelligence_router, prefix="/api/intelligence", tags=["intelligence"])
        logger.info("Mounted /api/intelligence router (AI Analysis).")
    except Exception as e:
        logger.warning(f"/api/intelligence router not mounted: {e}")
else:
    logger.info("CrewAI intelligence endpoints disabled (set ENABLE_CREW_AI=1 to enable).")

# --- Mount Event Context Router (Integration Layer) ---
try:
    from routers.event_context import router as event_context_router
    app.include_router(event_context_router)
    logger.info("Mounted /api/event-context router (Event Planning Integration).")
except Exception as e:
    logger.warning(f"/api/event-context router not mounted: {e}")

# --- Campaign Management Endpoints ---
class CampaignCreate(BaseModel):
    name: str

class CampaignOut(BaseModel):
    id: str
    name: str
    created_at: str

@app.post("/campaigns", response_model=CampaignOut, summary="Create Campaign")
def create_campaign(body: CampaignCreate, db: Session = Depends(get_db)):
    campaign_id = str(uuid.uuid4())
    campaign = Campaign(
        id=campaign_id,
        name=body.name,
        organizer_id=None
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return CampaignOut(
        id=campaign.id,
        name=campaign.name,
        created_at=campaign.created_at.isoformat()
    )

@app.get("/campaigns/{campaign_id}", response_model=CampaignOut, summary="Get Campaign")
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return CampaignOut(
        id=campaign.id,
        name=campaign.name,
        created_at=campaign.created_at.isoformat()
    )

if CREW_AI_ENABLED:
    from crewai import Agent, Task, Crew, Process

    # --- CrewAI Content Demo ---
    class TopicRequest(BaseModel):
        topic: str

    content_writer = Agent(
        role='Marketing Content Creator',
        goal='Generate engaging and creative content about a given topic: {topic}',
        backstory=(
            "You are a renowned Content Creator, known for your insightful and engaging articles. "
            "You transform complex concepts into compelling narratives."
        ),
        verbose=True,
        allow_delegation=False
    )

    write_content_task = Task(
        description=(
            "Write a short, engaging blog post about {topic}. "
            "The post should be easy to understand, interesting, and no more than 3 paragraphs."
        ),
        expected_output='A 3-paragraph blog post about the specified topic.',
        agent=content_writer
    )

    content_creation_crew = Crew(
        agents=[content_writer],
        tasks=[write_content_task],
        process=Process.sequential,
        verbose=True
    )

    if not SOCIAL_SHARING_AVAILABLE:
        @app.post("/generate-content", summary="Generate content about a topic (Legacy)")
        def generate_content(request: TopicRequest):
            """Kicks off the content creation crew to generate a blog post about the specified topic."""
            try:
                result = content_creation_crew.kickoff(inputs={"topic": request.topic})
                return {"result": result}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))
else:
    logger.info("CrewAI content generator disabled (set ENABLE_CREW_AI=1 to expose /generate-content)")

# --- Social Sharing Endpoints ---
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

if SOCIAL_SHARING_AVAILABLE:
    @app.post("/generate-content", summary="Generate content about a topic")
    def generate_content_endpoint(request: TopicRequest):
        """Generate captions for an event using AI agents."""
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

    @app.post("/share-post", summary="Share a post to Mastodon")
    def share_post_api(request: PostRequest):
        """Share a post with image and caption to Mastodon."""
        try:
            result = share_post(request.image_url, request.caption)
            return {"result": result}
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": str(e)})

    @app.post("/analytics", summary="Fetch post metrics")
    def analytics_api(request: AnalyticsRequest):
        """Get analytics for a posted item."""
        try:
            result = fetch_post_metrics(request.post_id)
            return {"result": result}
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": str(e)})

    @app.post("/auto-share", summary="Auto-generate caption and share")
    def auto_share(input: AutoShareInput):
        """Automatically generate captions and share to social media."""
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

    @app.get("/mastodon/verify", summary="Verify Mastodon connection")
    def mastodon_verify():
        """Verify Mastodon API credentials and connection."""
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

    logger.info("Social sharing endpoints mounted successfully.")
else:
    logger.warning("Social sharing endpoints disabled due to missing dependencies.")

@app.get("/", summary="Health Check")
def read_root():
    services = ["event-planner", "visual-composer"]
    if CREW_AI_ENABLED:
        services.append("intelligent-analysis")
    if SOCIAL_SHARING_AVAILABLE:
        services.append("social-sharing")

    endpoints = {
        "planner": "/campaigns/*, /planner/*, /venues/*, /providers/*",
        "design": "/api/design/*",
    }
    if CREW_AI_ENABLED:
        endpoints["intelligence"] = "/api/intelligence/*"
    if SOCIAL_SHARING_AVAILABLE:
        endpoints["social"] = "/generate-content, /share-post, /auto-share, /analytics, /mastodon/verify"

    return {
        "status": "Event Planner API is running",
        "version": "2.1.0",
        "services": services,
        "features": {
            "event_planning": True,
            "provider_matching": True,
            "ai_enable_flux": AI_ENABLE_FLUX,
            "cloudinary_configured": CLOUDINARY_READY,
            "crewai_intelligence": CREW_AI_ENABLED,
            "mongodb_connected": bool(os.getenv("MONGO_URI")),
            "social_sharing": SOCIAL_SHARING_AVAILABLE,
        },
        "endpoints": endpoints,
    }

# --- Dev runner ---
if __name__ == "__main__":
    import uvicorn
    # Use 1800 to match your frontend .env (VITE_API_BASE=http://127.0.0.1:1800)
    uvicorn.run("main:app", host="127.0.0.1", port=1800, reload=True)
