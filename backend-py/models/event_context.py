from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ProviderSelection(BaseModel):
    venue: Optional[Any] = None
    music: List[Any] = []
    lighting: Optional[Any] = None
    sound: Optional[Any] = None

class EventContext(BaseModel):
    campaign_id: str
    event_name: str
    venue: str
    event_date: str
    attendees_estimate: int
    total_budget_lkr: int
    number_of_concepts: int = 3
    selectedConcept: Optional[Dict[str, Any]] = None
    selections: Optional[ProviderSelection] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EventContextResponse(BaseModel):
    campaign_id: str
    data: EventContext
    created_at: datetime
