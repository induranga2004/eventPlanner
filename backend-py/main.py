import os
import uuid
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv
from sqlalchemy.orm import Session

# Import advanced architecture components
from config.database import engine, get_db, Base
from models.campaign import Campaign
from models.event_planner import EventPlan, PlanCost, PlanTimeline, SelectedPlan
from routers.planner import router as planner_router
from routers.venues import router as venues_router

# Load environment variables from .env file
load_dotenv()

# Check for OpenAI API key (used by the CrewAI content demo)
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in your .env file.")

# --- FastAPI App ---
app = FastAPI(
    title="Event Planner & Content API",
    description="Planner (budgets/timeline/venues) + CrewAI content agent.",
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

# --- Advanced Architecture Routers ---
app.include_router(planner_router)
app.include_router(venues_router)

# --- Campaign Management Endpoints ---
class CampaignCreate(BaseModel):
    name: str

class CampaignOut(BaseModel):
    id: str
    name: str
    created_at: str

@app.post("/campaigns", response_model=CampaignOut)
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

@app.get("/campaigns/{campaign_id}", response_model=CampaignOut)
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
        # In production, prefer raising HTTPException with proper status codes
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/campaigns", summary="Create Campaign")
def create_campaign(name: str = "New Campaign"):
    """Create a new campaign - simple version"""
    from uuid import uuid4
    return {"id": str(uuid4()), "name": name}

@app.get("/", summary="Health Check")
def read_root():
    return {"status": "Advanced Event Planner API is running"}

# --- Simple Event Planner Endpoints (matching your frontend) ---
@app.post("/campaigns/{campaign_id}/planner/generate", summary="Generate Event Plans")
def generate_event_plans(campaign_id: str, payload: dict):
    """Generate event plans for a campaign - working with your frontend"""
    from datetime import datetime, date
    from uuid import uuid4
    
    # Parse the event date
    event_date_str = payload.get("event_date", "2025-12-01")
    event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()
    budget = payload.get("total_budget_lkr", 1000000)
    attendees = payload.get("attendees_estimate", 100)
    
    # Generate concepts matching your frontend expectations
    concepts = []
    num_concepts = payload.get("number_of_concepts", 2)
    
    concept_types = [
        {"title": "Elegant Hall Wedding", "budget_profile": "Premium"},
        {"title": "Garden Glam Reception", "budget_profile": "Budget-Friendly"},
        {"title": "Classic Ballroom Affair", "budget_profile": "Corporate"},
        {"title": "Seaside Chic Evening", "budget_profile": "Boutique"}
    ]
    
    for i in range(num_concepts):
        concept = concept_types[i % len(concept_types)]
        
        # Realistic cost breakdown
        costs = [
            {"category": "venue", "amount_lkr": int(budget * 0.40)},
            {"category": "catering", "amount_lkr": int(budget * 0.25)},
            {"category": "decoration", "amount_lkr": int(budget * 0.15)},
            {"category": "entertainment", "amount_lkr": int(budget * 0.10)},
            {"category": "logistics", "amount_lkr": int(budget * 0.05)},
            {"category": "marketing", "amount_lkr": int(budget * 0.03)},
            {"category": "contingency", "amount_lkr": int(budget * 0.02)}
        ]
        
        total_cost = sum(c["amount_lkr"] for c in costs)
        
        concepts.append({
            "id": f"A{i+1}",
            "title": f"{payload.get('event_name', 'Event')} - {concept['title']}",
            "budget_profile": concept["budget_profile"],
            "total_lkr": total_cost,
            "costs": costs,
            "assumptions": [
                f"Premium venue in {payload.get('city', 'TBD')}",
                f"Capacity: {attendees} attendees",
                f"Event type: {payload.get('event_type', 'wedding')}",
                "Professional coordination included"
            ]
        })
    
    # Timeline with proper offset_days format
    days_to_event = (event_date - date.today()).days
    timeline = [
        {"offset_days": -30 if days_to_event > 30 else max(-days_to_event + 1, -1), "milestone": "Vendor shortlist & RFPs"},
        {"offset_days": -21 if days_to_event > 21 else max(-days_to_event + 1, -1), "milestone": "Confirm venue & core vendors"},
        {"offset_days": -14 if days_to_event > 14 else max(-days_to_event + 1, -1), "milestone": "Lock menu & décor plan"},
        {"offset_days": -7 if days_to_event > 7 else max(-days_to_event + 1, -1), "milestone": "Final run sheet + contact list"},
        {"offset_days": -1, "milestone": "Setup & checks"},
        {"offset_days": 0, "milestone": "Event day"}
    ]
    
    per_person = int(budget / max(attendees, 1)) if attendees > 0 else 0
    
    # Get venue suggestions
    suggested_venues = []
    city = payload.get("city", "")
    event_type = payload.get("event_type", "wedding")
    
    if city:
        # Use the same venue finder logic
        csv_path = os.path.join(os.path.dirname(__file__), "data", "venues.csv")
        if os.path.exists(csv_path):
            try:
                import csv
                with open(csv_path, "r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        if row.get("city", "").strip().lower() == city.strip().lower():
                            venue_type = (row.get("type", "") or "").lower()
                            if (event_type.lower() in venue_type) or (venue_type in event_type.lower()):
                                suggested_venues.append({
                                    "name": row.get("name"),
                                    "address": row.get("address"),
                                    "type": row.get("type"),
                                    "capacity": int(row.get("capacity") or 0),
                                    "avg_cost_lkr": int(row.get("avg_cost_lkr") or 0),
                                    "rating": float(row.get("rating") or 0.0),
                                    "website": row.get("website"),
                                    "min_lead_days": int(row.get("min_lead_days") or 0)
                                })
                suggested_venues.sort(key=lambda r: (r.get("rating", 0), r.get("capacity", 0)), reverse=True)
                suggested_venues = suggested_venues[:5]  # Top 5 venues
            except Exception:
                pass
    
    # Calculate recommended lead time from venues
    known_leads = [v.get("min_lead_days", 0) for v in suggested_venues if v.get("min_lead_days", 0) > 0]
    recommended_lead_days = max(known_leads) if known_leads else 30
    
    # Check if event is too soon
    venue_booking_risk = days_to_event < recommended_lead_days
    venue_booking_note = None
    if venue_booking_risk:
        venue_booking_note = f"Event in {days_to_event} days; popular venues often require ~{recommended_lead_days} days lead time."
    
    return {
        "campaign_id": campaign_id,
        "event": {
            "name": payload.get("event_name", "Untitled Event"),
            "type": payload.get("event_type", "wedding"),
            "city": payload.get("city", ""),
            "venue": payload.get("venue", ""),
            "date": event_date_str,
            "attendees": attendees,
            "audience_profile": payload.get("audience_profile", ""),
            "notes": payload.get("special_instructions", "")
        },
        "concepts": concepts,
        "timeline": timeline,
        "derived": {
            "feasibility_notes": [
                f"Approx LKR {per_person:,} per person",
                "Venue allocation is high (40%) to secure premium venue",
                f"Timeline assumes {max(abs(timeline[0]['offset_days']), 7)} days for planning"
            ],
            "suggested_venues": suggested_venues,
            "recommended_lead_days": recommended_lead_days,
            "venue_booking_risk": venue_booking_risk,
            "venue_booking_note": venue_booking_note
        }
    }

@app.get("/campaigns/{campaign_id}/planner/results", summary="Get Event Plan Results")
def get_event_plan_results(campaign_id: str):
    """Get previously generated event plan results"""
    return {"message": f"Results for campaign {campaign_id}", "status": "not_implemented"}

@app.post("/campaigns/{campaign_id}/planner/select", summary="Select Event Concept")
def select_event_concept(campaign_id: str, payload: dict):
    """Select a specific event concept"""
    concept_id = payload.get("concept_id")
    return {"message": f"Selected concept {concept_id} for campaign {campaign_id}", "status": "success"}

# --- Venue Finder Endpoint ---
@app.get("/venues/suggest", summary="Suggest venues for a city & event type")
def suggest_venues(city: str, event_type: str = "wedding", top_k: int = 7):
    """Find venues from CSV database"""
    import csv
    import os
    
    # Path to venues CSV
    csv_path = os.path.join(os.path.dirname(__file__), "data", "venues.csv")
    results = []
    
    if not os.path.exists(csv_path):
        return [{"error": f"Venues database not found at {csv_path}"}]
    
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Match city (case-insensitive)
                if row.get("city", "").strip().lower() != city.strip().lower():
                    continue
                
                # Match event type (loose matching)
                venue_type = (row.get("type", "") or "").lower()
                if (event_type.lower() in venue_type) or (venue_type in event_type.lower()) or (event_type.lower() == "wedding"):
                    results.append({
                        "name": row.get("name"),
                        "address": row.get("address"),
                        "type": row.get("type"),
                        "capacity": int(row.get("capacity") or 0),
                        "avg_cost_lkr": int(row.get("avg_cost_lkr") or 0),
                        "rating": float(row.get("rating") or 0.0),
                        "website": row.get("website"),
                        "min_lead_days": int(row.get("min_lead_days") or 0),
                        "source": "csv"
                    })
        
        # Sort by rating and capacity
        results.sort(key=lambda r: (r.get("rating", 0), r.get("capacity", 0)), reverse=True)
        return results[:top_k]
        
    except Exception as e:
        return [{"error": f"Error reading venues database: {str(e)}"}]

# --- Server runner for development ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
