from fastapi import APIRouter, HTTPException
from models.event_context import EventContext, EventContextResponse
from datetime import datetime
from typing import Dict
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/event-context", tags=["event-context"])

# In-memory storage (replace with database in production)
event_contexts: Dict[str, EventContext] = {}

@router.post("/save")
async def save_event_context(context: EventContext):
    """
    Save event planning context for later use in AI poster generation
    """
    try:
        # Add timestamp if not provided
        if not context.timestamp:
            context.timestamp = datetime.now().isoformat()
        
        # Store in memory (use MongoDB/SQLite in production)
        event_contexts[context.campaign_id] = context
        
        return {
            "success": True,
            "campaign_id": context.campaign_id,
            "message": "Event context saved successfully",
            "timestamp": context.timestamp
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save context: {str(e)}")

@router.get("/{campaign_id}")
async def get_event_context(campaign_id: str):
    """
    Retrieve stored event planning context
    """
    context = event_contexts.get(campaign_id)
    
    if not context:
        raise HTTPException(status_code=404, detail="Event context not found")
    
    return context

@router.delete("/{campaign_id}")
async def delete_event_context(campaign_id: str):
    """
    Delete event context
    """
    if campaign_id in event_contexts:
        del event_contexts[campaign_id]
        return {"success": True, "message": "Context deleted"}
    
    raise HTTPException(status_code=404, detail="Context not found")

@router.get("/")
async def list_event_contexts():
    """
    List all stored contexts (for debugging)
    """
    return {
        "count": len(event_contexts),
        "contexts": [
            {
                "campaign_id": ctx.campaign_id,
                "event_name": ctx.event_name,
                "timestamp": ctx.timestamp
            }
            for ctx in event_contexts.values()
        ]
    }
