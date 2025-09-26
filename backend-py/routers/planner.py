# backend-py/routers/planner.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import date

from config.database import get_db
from models.event_planner import EventPlan, PlanCost, PlanTimeline, SelectedPlan
from models.campaign import Campaign

from planner.service import (
    generate_costs, compress_milestones, concept_ids,
    pick_title, pick_assumptions, feasibility_notes, uuid,
    apply_venue_lead_time
)
from agents.venue_finder import find_venues

router = APIRouter(prefix="/campaigns", tags=["planner"])

EventType = Literal["wedding", "concert", "corporate", "workshop", "birthday"]

class WizardInput(BaseModel):
    campaign_id: str
    event_name: str
    event_type: EventType
    city: str
    venue: Optional[str] = ""
    event_date: date
    attendees_estimate: int = Field(ge=1)
    audience_profile: str
    special_instructions: Optional[str] = ""
    total_budget_lkr: int = Field(ge=50000)
    number_of_concepts: int = Field(ge=1, le=4, default=2)

class CostItem(BaseModel):
    category: str
    amount_lkr: int

class Concept(BaseModel):
    id: str
    title: str
    assumptions: List[str]
    costs: List[CostItem]
    total_lkr: int
    budget_profile: str = "ConceptA_PremiumVenue"

class EventInfo(BaseModel):
    name: str
    type: EventType
    city: str
    venue: str
    date: date
    attendees: int
    audience_profile: str
    notes: str

class TimelineItem(BaseModel):
    offset_days: int
    milestone: str

class EventPlanOut(BaseModel):
    campaign_id: str
    event: EventInfo
    concepts: List[Concept]
    timeline: List[TimelineItem]
    derived: dict  # contains feasibility_notes, suggested_venues, recommended_lead_days, venue_booking_risk, venue_booking_note


@router.post("/{campaign_id}/planner/generate", response_model=EventPlanOut)
def generate_plans(campaign_id: str, body: WizardInput, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    event_info = EventInfo(
        name=body.event_name,
        type=body.event_type,
        city=body.city,
        venue=body.venue or "",
        date=body.event_date,
        attendees=body.attendees_estimate,
        audience_profile=body.audience_profile,
        notes=body.special_instructions or ""
    )

    # Generate concepts and persist
    concept_list: List[Concept] = []
    ids = concept_ids(body.number_of_concepts)
    for idx, cid in enumerate(ids):
        title = pick_title(idx)
        assumptions = pick_assumptions(idx)
        cost_pairs = generate_costs(body.total_budget_lkr)
        costs = [CostItem(category=c, amount_lkr=v) for c, v in cost_pairs]
        total = sum(c.amount_lkr for c in costs)

        plan_id = uuid()
        plan = EventPlan(
            id=plan_id,
            campaign_id=campaign_id,
            concept_key=cid,
            concept_title=title,
            assumptions="|".join(assumptions),
            total_lkr=total,
            budget_profile="ConceptA_PremiumVenue"
        )
        db.add(plan)
        for c in costs:
            db.add(PlanCost(id=uuid(), event_plan_id=plan_id, category=c.category, amount_lkr=c.amount_lkr))
        # timeline base (same per concept)
        for off, label in compress_milestones(event_info.date):
            db.add(PlanTimeline(id=uuid(), event_plan_id=plan_id, offset_days=off, milestone=label))
        db.commit()

        concept_list.append(
            Concept(
                id=cid,
                title=title,
                assumptions=assumptions,
                costs=costs,
                total_lkr=total,
                budget_profile="ConceptA_PremiumVenue"
            )
        )

    # Venue suggestions (hybrid: SerpAPI or CSV fallback)
    suggested = find_venues(body.city, body.event_type, top_k=5)
    known_leads = [
        v.get("min_lead_days") for v in suggested
        if isinstance(v.get("min_lead_days"), int) and v.get("min_lead_days") > 0
    ]
    recommended_lead_days = max(known_leads) if known_leads else 30

    # Build timeline with lead-time consideration
    base_tl = [(o, m) for o, m in compress_milestones(event_info.date)]
    tl_with_lead = apply_venue_lead_time(event_info.date, base_tl, recommended_lead_days)

    days_to_event = (event_info.date - date.today()).days
    risk = days_to_event < recommended_lead_days
    risk_note = None
    if risk:
        rld = recommended_lead_days
        risk_note = f"Event in {days_to_event} days; popular venues often require ~{rld} days lead time."

    out = EventPlanOut(
        campaign_id=campaign_id,
        event=event_info,
        concepts=concept_list,
        timeline=[TimelineItem(offset_days=o, milestone=m) for o, m in tl_with_lead],
        derived={
            "feasibility_notes": feasibility_notes(body.total_budget_lkr, body.attendees_estimate),
            "suggested_venues": suggested,
            "recommended_lead_days": recommended_lead_days,
            "venue_booking_risk": risk,
            "venue_booking_note": risk_note
        }
    )
    return out
