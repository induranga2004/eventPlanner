import logging
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# --- Project imports (package-style) ---
from config.database import engine, get_db, Base
from models.campaign import Campaign
from routers.planner import router as planner_router
from routers.venues import router as venues_router
from routers.catering import router as catering_router  # <-- add catering route


logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Check for OpenAI API key (used by the CrewAI content demo and OpenAI-powered tools)
if not os.getenv("OPENAI_API_KEY"):
    logger.warning("OPENAI_API_KEY not found; AI-powered enhancements will fall back to CSV data only.")

# --- FastAPI App ---
app = FastAPI(
    title="Musical Event Planner API",
    description="Specialised planner for live musical performances with budgets, venues, catering, and CrewAI content agent.",
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database initialization ---
Base.metadata.create_all(bind=engine)

# --- Mount Routers (real endpoints) ---
# Planner endpoints:
#   POST /campaigns/{campaign_id}/planner/generate
#   GET  /campaigns/{campaign_id}/planner/results
#   POST /campaigns/{campaign_id}/planner/select
app.include_router(planner_router)

# Venue suggestions:
#   GET /venues/suggest?city=...&event_type?=musical&top_k=7
app.include_router(venues_router)

# Catering suggestions (OpenAI + CSV facts):
#   GET /catering/suggest?city=...&event_type?=musical&venue=...&attendees=...
app.include_router(catering_router)

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
    return {"status": "Musical Event Planner API is running"}

# --- Dev runner ---
if __name__ == "__main__":
    import uvicorn
    # Use 1800 to match your frontend .env (VITE_API_BASE=http://127.0.0.1:1800)
    uvicorn.run("main:app", host="127.0.0.1", port=1800, reload=True)
