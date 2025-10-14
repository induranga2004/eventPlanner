import logging
import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# --- Project imports (package-style) ---
from config.database import engine, get_db, Base
from config.settings import load_environment
from models.campaign import Campaign
from routers.planner import router as planner_router
from routers.venues import router as venues_router


logger = logging.getLogger(__name__)

# Load environment variables
load_environment()

# Check for OpenAI API key (used by the CrewAI content demo and OpenAI-powered tools)
# Check for required environment variables
if not os.getenv("OPENAI_API_KEY"):
    logger.warning(
        "OPENAI_API_KEY not found; AI-powered enhancements will rely on Mongo provider data only."
    )

# --- FastAPI App Setup ---
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

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health Check Endpoint ---
@app.get("/", summary="Health Check")
def health_check():
    """
    Basic health check endpoint to verify the API is running.
    """
    return {
        "status": "Event Planner AI Backend is running",
        "version": "1.0.0",
        "services": ["event-planning", "post-generation", "content-optimization"]
    }

# =============================================================================
# PLACEHOLDER ENDPOINTS FOR TEAM MEMBERS
# =============================================================================

# --- EVENT PLANNING ENDPOINTS (For Dhananjana) ---
@app.post("/api/events/suggest-plan", summary="Get Event Planning Suggestions")
def suggest_event_plan():
    """
    PLACEHOLDER: Dhananjana will implement this endpoint
    - Generate event planning suggestions based on user requirements
    - Input: event type, budget, attendees, etc.
    - Output: AI-generated event plan with timeline, tasks, recommendations
    """
    return {"message": "Event planning endpoint - To be implemented by Dhananjana"}

@app.post("/api/events/generate-checklist", summary="Generate Event Checklist")
def generate_event_checklist():
    """
    PLACEHOLDER: Dhananjana will implement this endpoint
    - Create customized event planning checklists
    - Input: event details
    - Output: Step-by-step checklist with timelines
    """
    return {"message": "Event checklist endpoint - To be implemented by Dhananjana"}

# --- POST GENERATION ENDPOINTS (For Heshan) ---
@app.post("/api/posts/generate-content", summary="Generate Social Media Posts")
def generate_social_media_posts():
    """
    PLACEHOLDER: Heshan will implement this endpoint
    - Generate engaging social media posts for events
    - Input: event details, target platform, tone
    - Output: AI-generated social media content
    """
    return {"message": "Post generation endpoint - To be implemented by Heshan"}

@app.post("/api/posts/optimize-content", summary="Optimize Content for Platform")
def optimize_content_for_platform():
    """
    PLACEHOLDER: Heshan will implement this endpoint
    - Optimize existing content for specific social media platforms
    - Input: base content, target platform
    - Output: Platform-optimized content
    """
    return {"message": "Content optimization endpoint - To be implemented by Heshan"}

# --- CONTENT SHARING ENDPOINTS (For Integration with Hirushan's work) ---
@app.post("/api/sharing/prepare-content", summary="Prepare Content for Sharing")
def prepare_content_for_sharing():
    """
    PLACEHOLDER: Integration endpoint for sharing functionality
    - Prepare generated content for external sharing
    - Input: generated content, sharing preferences
    - Output: Formatted content ready for sharing APIs
    """
    return {"message": "Content sharing preparation endpoint - For integration with Hirushan's work"}

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@app.get("/api/templates", summary="Get Available Templates")
def get_templates():
    """
    Get available event and content templates
    """
    return {
        "event_templates": ["wedding", "corporate", "birthday", "conference"],
        "content_templates": ["announcement", "invitation", "thank_you", "recap"]
    }

@app.get("/api/status", summary="Check AI Service Status")
def check_ai_status():
    """
    Check if AI services (OpenAI) are accessible
    """
    try:
        # Simple check to verify OpenAI API key exists
        if os.getenv("OPENAI_API_KEY"):
            return {"status": "AI services ready", "openai_configured": True}
        else:
            return {"status": "AI services not configured", "openai_configured": False}
    except Exception as e:
        return {"status": "Error checking AI services", "error": str(e)}

# =============================================================================
# INSTRUCTIONS FOR TEAM MEMBERS
# =============================================================================
"""
TEAM MEMBER IMPLEMENTATION GUIDE:

1. DHANANJANA (Event Planning):
   - Implement logic in routers/events.py
   - Create models in models/event.py
   - Focus on: /api/events/suggest-plan and /api/events/generate-checklist

2. HESHAN (AI Post Generator):
   - Implement logic in routers/posts.py
   - Create models in models/post.py
   - Focus on: /api/posts/generate-content and /api/posts/optimize-content

3. INTEGRATION POINTS:
   - All generated content should be compatible with Hirushan's sharing system
   - Use consistent data models across all endpoints

4. TESTING:
   - Test each endpoint individually before integration
   - Use /api/status to verify AI services are working

5. HOW TO ADD YOUR IMPLEMENTATION:
   - Create your router file in routers/
   - Create your models in models/
   - Import and include your router in this main.py file
   
   Example:
   from routers import events, posts
   app.include_router(events.router, prefix="/api/events")
   app.include_router(posts.router, prefix="/api/posts")
"""
