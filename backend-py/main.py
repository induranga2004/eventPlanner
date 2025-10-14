import logging
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from sqlalchemy.orm import Session

# --- Project imports (package-style) ---
from config.database import engine, get_db, Base
from config.settings import load_environment
from models.campaign import Campaign
from routers.planner import router as planner_router
from routers.venues import router as venues_router
from routers.concept_names import router as concept_names_router
from routers.providers import router as providers_router

logger = logging.getLogger(__name__)

# Load environment variables
load_environment()

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    logger.warning(
        "OPENAI_API_KEY not found; AI-powered enhancements will rely on Mongo provider data only."
    )

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
    title="Event Planner API with AI Visual Composer",
    description="Musical event planner with budgets, venues, catering, and AI-powered visual design tools.",
    version="2.0.0"
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

try:
    from routers.intelligence import router as intelligence_router
    app.include_router(intelligence_router, prefix="/api/intelligence", tags=["intelligence"])
    logger.info("Mounted /api/intelligence router (AI Analysis).")
except Exception as e:
    logger.warning(f"/api/intelligence router not mounted: {e}")

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

@app.post("/generate-content", summary="Generate content about a topic")
def generate_content(request: TopicRequest):
    """Kicks off the content creation crew to generate a blog post about the specified topic."""
    try:
        result = content_creation_crew.kickoff(inputs={"topic": request.topic})
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/", summary="Health Check")
def read_root():
    return {
        "status": "Event Planner API is running",
        "version": "2.0.0",
        "services": ["event-planner", "visual-composer", "intelligent-analysis"],
        "features": {
            "event_planning": True,
            "provider_matching": True,
            "ai_enable_flux": AI_ENABLE_FLUX,
            "cloudinary_configured": CLOUDINARY_READY,
            "crewai_intelligence": True,
            "mongodb_connected": bool(os.getenv("MONGO_URI")),
        },
        "endpoints": {
            "planner": "/campaigns/*, /planner/*, /venues/*, /providers/*",
            "design": "/api/design/*",
            "intelligence": "/api/intelligence/*"
        }
    }

# --- Dev runner ---
if __name__ == "__main__":
    import uvicorn
    # Use 1800 to match your frontend .env (VITE_API_BASE=http://127.0.0.1:1800)
    uvicorn.run("main:app", host="127.0.0.1", port=1800, reload=True)
