# backend-py/models/campaign.py
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(String, primary_key=True)  # uuid
    name = Column(String, nullable=False)
    organizer_id = Column(String, nullable=True)  # For future user system
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    plans = relationship("EventPlan", back_populates="campaign")