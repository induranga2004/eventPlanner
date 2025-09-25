import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for required environment variables
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY environment variable not found. Please set it in your .env file.")

# --- FastAPI App Setup ---
app = FastAPI(
    title="Event Planner AI Backend",
    description="AI-powered backend for event planning and social media content generation",
    version="1.0.0"
)

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
