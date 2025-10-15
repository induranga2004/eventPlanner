from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel
from sqlalchemy import Column, DateTime, String
from sqlalchemy.types import JSON

from config.database import Base

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

class EventContextRecord(Base):
    __tablename__ = "event_contexts"

    campaign_id = Column(String, primary_key=True)
    event_name = Column(String, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
