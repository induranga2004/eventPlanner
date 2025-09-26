# backend-py/models/event_planner.py
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

class EventPlan(Base):
    __tablename__ = "event_plans"
    id = Column(String, primary_key=True)               # uuid
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    concept_key = Column(String, nullable=False)        # A1..A4
    concept_title = Column(String, nullable=False)
    assumptions = Column(Text, nullable=False)          # pipe-joined list for MVP
    total_lkr = Column(Integer, nullable=False)
    budget_profile = Column(String, default="ConceptA_PremiumVenue")
    created_at = Column(DateTime, server_default=func.now())

    campaign = relationship("Campaign", back_populates="plans", lazy="joined")
    costs = relationship("PlanCost", back_populates="plan", cascade="all, delete-orphan")
    timeline = relationship("PlanTimeline", back_populates="plan", cascade="all, delete-orphan")

class PlanCost(Base):
    __tablename__ = "plan_costs"
    id = Column(String, primary_key=True)               # uuid
    event_plan_id = Column(String, ForeignKey("event_plans.id"), nullable=False)
    category = Column(String, nullable=False)           # venue/catering/...
    amount_lkr = Column(Integer, nullable=False)
    currency = Column(String, default="LKR")

    plan = relationship("EventPlan", back_populates="costs")

class PlanTimeline(Base):
    __tablename__ = "plan_timeline"
    id = Column(String, primary_key=True)               # uuid
    event_plan_id = Column(String, ForeignKey("event_plans.id"), nullable=False)
    offset_days = Column(Integer, nullable=False)
    milestone = Column(String, nullable=False)
    owner = Column(String, nullable=True)

    plan = relationship("EventPlan", back_populates="timeline")

class SelectedPlan(Base):
    __tablename__ = "selected_plans"
    id = Column(String, primary_key=True)               # uuid
    campaign_id = Column(String, ForeignKey("campaigns.id"), nullable=False)
    event_plan_id = Column(String, ForeignKey("event_plans.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
