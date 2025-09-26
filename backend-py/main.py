import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in your .env file.")

# --- FastAPI App ---
app = FastAPI(
    title="CrewAI Content Creation API",
    description="An API to generate content using a CrewAI agent.",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str

# --- CrewAI Setup ---

# 1. Create the Agent
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

# 2. Create the Task
# The task description now directly uses the {topic} placeholder
write_content_task = Task(
    description=(
        "Write a short, engaging blog post about {topic}. "
        "The post should be easy to understand, interesting, and no more than 3 paragraphs."
    ),
    expected_output='A 3-paragraph blog post about the specified topic.',
    agent=content_writer
)

# 3. Create the Crew
# The crew is simplified as it only has one agent and one task
content_creation_crew = Crew(
    agents=[content_writer],
    tasks=[write_content_task],
    process=Process.sequential,
    verbose=True
)

# --- API Endpoint ---

@app.post("/generate-content", summary="Generate content about a topic")
def generate_content(request: TopicRequest):
    """
    Kicks off the content creation crew to generate a blog post about the specified topic.
    """
    try:
        # The input for the crew is a dictionary with the topic
        inputs = {'topic': request.topic}
        result = content_creation_crew.kickoff(inputs=inputs)
        return {"result": result}
    except Exception as e:
        return {"error": str(e)}, 500

@app.post("/campaigns/{campaign_id}/planner/generate", summary="Generate Event Plans")
def generate_event_plans(campaign_id: str, payload: dict):
    """
    Generate event plans for a campaign.
    This is a mock implementation for now.
    """
    import random
    from datetime import datetime, timedelta
    
    # Mock response matching the frontend expectations
    event_date = datetime.strptime(payload.get("event_date", "2025-12-01"), "%Y-%m-%d")
    budget = payload.get("total_budget_lkr", 1000000)
    attendees = payload.get("attendees_estimate", 100)
    
    # Generate mock concepts
    concepts = []
    num_concepts = payload.get("number_of_concepts", 2)
    
    concept_types = [
        {"title": "Premium Experience", "budget_profile": "High-End"},
        {"title": "Community Edition", "budget_profile": "Budget-Friendly"},
        {"title": "Corporate Style", "budget_profile": "Professional"},
        {"title": "Intimate Gathering", "budget_profile": "Boutique"}
    ]
    
    for i in range(num_concepts):
        concept = concept_types[i % len(concept_types)]
        
        # Mock cost breakdown
        costs = [
            {"category": "Venue", "amount_lkr": int(budget * 0.35)},
            {"category": "Catering", "amount_lkr": int(budget * 0.25)},
            {"category": "Entertainment", "amount_lkr": int(budget * 0.15)},
            {"category": "Decoration", "amount_lkr": int(budget * 0.10)},
            {"category": "Staff", "amount_lkr": int(budget * 0.08)},
            {"category": "Marketing", "amount_lkr": int(budget * 0.05)},
            {"category": "Contingency", "amount_lkr": int(budget * 0.02)}
        ]
        
        concepts.append({
            "id": f"concept-{i+1}",
            "title": f"{payload.get('event_name', 'Event')} - {concept['title']}",
            "budget_profile": concept["budget_profile"],
            "total_lkr": budget,
            "costs": costs,
            "assumptions": [
                f"Venue capacity: {attendees} attendees",
                f"Location: {payload.get('city', 'TBD')}",
                f"Event type: {payload.get('event_type', 'general')}",
                "Professional setup and coordination included"
            ]
        })
    
    # Mock timeline
    timeline = [
        {"milestone": "Planning Phase", "offset_days": -30},
        {"milestone": "Vendor Booking", "offset_days": -21},
        {"milestone": "Marketing Launch", "offset_days": -14},
        {"milestone": "Final Preparations", "offset_days": -3},
        {"milestone": "Event Day", "offset_days": 0}
    ]
    
    return {
        "event": {
            "name": payload.get("event_name", "Untitled Event"),
            "date": payload.get("event_date"),
            "city": payload.get("city"),
            "attendees": attendees
        },
        "concepts": concepts,
        "timeline": timeline,
        "derived": {
            "feasibility_notes": [
                f"Budget allows for {concept['budget_profile'].lower()} quality execution",
                f"Timeline assumes {abs(timeline[0]['offset_days'])} days for planning",
                "All costs are estimates and may vary based on final vendor selection"
            ]
        }
    }

@app.get("/campaigns/{campaign_id}/planner/results", summary="Get Event Plan Results")
def get_event_plan_results(campaign_id: str):
    """
    Get previously generated event plan results.
    Mock implementation.
    """
    return {"message": f"Results for campaign {campaign_id}", "status": "not_implemented"}

@app.post("/campaigns/{campaign_id}/planner/select", summary="Select Event Concept")
def select_event_concept(campaign_id: str, payload: dict):
    """
    Select a specific event concept.
    Mock implementation.
    """
    concept_id = payload.get("concept_id")
    return {"message": f"Selected concept {concept_id} for campaign {campaign_id}", "status": "success"}

@app.get("/", summary="Health Check")
def read_root():
    """
    A simple health check endpoint.
    """
    return {"status": "API is running"}

# To run this application:
# 1. Make sure you have an .env file with your OPENAI_API_KEY.
# 2. Run the command: uvicorn main:app --reload
