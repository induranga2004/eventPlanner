# backend-py/routers/planner.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

from config.database import get_db
from models.event_planner import EventPlan, PlanCost, PlanTimeline, SelectedPlan
from models.campaign import Campaign

from planner.service import (
    DEFAULT_EVENT_TYPE,
    generate_costs,
    compress_milestones,
    concept_ids,
    pick_title,
    pick_assumptions,
    pick_concept_details,
    feasibility_notes,
    uuid,
    apply_venue_lead_time,
    generate_dynamic_costs,
)
from agents.venue_finder import find_venues

router = APIRouter(prefix="/campaigns", tags=["planner"])

DEFAULT_CITY = "Colombo"

class WizardInput(BaseModel):
    campaign_id: str
    event_name: str
    venue: str
    event_date: date
    attendees_estimate: int = Field(ge=1)
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
    venue: str
    date: date
    attendees: int

class TimelineItem(BaseModel):
    offset_days: int
    milestone: str

class EventPlanOut(BaseModel):
    campaign_id: str
    event: EventInfo
    concepts: List[Concept]
    timeline: List[TimelineItem]
    # contains: feasibility_notes, suggested_venues, recommended_lead_days, venue_booking_risk, venue_booking_note
    derived: dict


@router.post("/{campaign_id}/planner/generate", response_model=EventPlanOut)
def generate_plans(campaign_id: str, body: WizardInput, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    event_info = EventInfo(
        name=body.event_name,
        venue=body.venue,
        date=body.event_date,
        attendees=body.attendees_estimate,
    )

    # Remove any existing plans for this campaign to avoid duplicates
    existing_plans = db.query(EventPlan).filter(EventPlan.campaign_id == campaign_id).all()
    for plan in existing_plans:
        db.delete(plan)
    db.flush()

    # Generate concepts and persist
    concept_list: List[Concept] = []
    ids = concept_ids(body.number_of_concepts)

    # Get venue suggestions for dynamic pricing
    suggested_venues = find_venues(DEFAULT_CITY, DEFAULT_EVENT_TYPE, top_k=10)

    # Determine recommended lead time and timeline up front
    suggested = suggested_venues[:5]
    known_leads = [
        v.get("min_lead_days") for v in suggested
        if isinstance(v.get("min_lead_days"), int) and v.get("min_lead_days") > 0
    ]
    recommended_lead_days = max(known_leads) if known_leads else 30

    base_timeline = compress_milestones(event_info.date)
    tl_with_lead = apply_venue_lead_time(event_info.date, base_timeline, recommended_lead_days)

    for cid in ids:
        title = pick_title(cid)
        assumptions = pick_assumptions(cid)
        concept_details = pick_concept_details(cid)

        # Generate initial costs based on concept theme
        cost_pairs = generate_costs(body.total_budget_lkr, cid)
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
            budget_profile=concept_details["title"]
        )
        db.add(plan)
        for c in costs:
            db.add(PlanCost(id=uuid(), event_plan_id=plan_id, category=c.category, amount_lkr=c.amount_lkr))
        for off, label in tl_with_lead:
            db.add(PlanTimeline(id=uuid(), event_plan_id=plan_id, offset_days=off, milestone=label))

        concept_list.append(
            Concept(
                id=cid,
                title=title,
                assumptions=assumptions,
                costs=costs,
                total_lkr=total,
                budget_profile=concept_details["title"]
            )
        )

    db.commit()

    # Venue booking risk note
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
            "venue_booking_note": risk_note,
        }
    )
    return out


# --- NEW: Dynamic Pricing Endpoints ---

class VenueSelection(BaseModel):
    venue_name: str
    venue_data: dict  # Full venue object from suggestions

class UpdateCostsRequest(BaseModel):
    concept_id: str
    venue_selection: Optional[VenueSelection] = None
    attendees: int
    total_budget_lkr: int

class UpdatedCostsResponse(BaseModel):
    concept_id: str
    updated_costs: List[CostItem]
    total_lkr: int
    cost_breakdown_notes: List[str]
    venue_cost: int
    savings_or_overage: int

@router.post("/{campaign_id}/planner/update-costs", response_model=UpdatedCostsResponse)
def update_concept_costs(
    campaign_id: str, 
    body: UpdateCostsRequest, 
    db: Session = Depends(get_db)
):
    """Update concept costs based on venue selections and attendee adjustments."""
    
    # Verify campaign exists
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    venue_data = body.venue_selection.venue_data if body.venue_selection else None
    # Generate dynamic costs
    cost_pairs = generate_dynamic_costs(
        total_budget_lkr=body.total_budget_lkr,
        concept_id=body.concept_id,
        venue_data=venue_data,
        attendees=body.attendees
    )
    
    costs = [CostItem(category=c, amount_lkr=v) for c, v in cost_pairs]
    total = sum(c.amount_lkr for c in costs)
    
    # Calculate individual costs for transparency
    venue_cost = next((c.amount_lkr for c in costs if c.category == "venue"), 0)
    # Calculate savings or overage
    savings_or_overage = body.total_budget_lkr - total
    
    # Generate notes
    notes = []
    if venue_data:
        notes.append(f"Venue: {venue_data.get('name', 'Selected venue')} - LKR {venue_cost:,}")
    if savings_or_overage > 0:
        notes.append(f"Under budget by LKR {savings_or_overage:,}")
    elif savings_or_overage < 0:
        notes.append(f"Over budget by LKR {abs(savings_or_overage):,}")
    else:
        notes.append("Exactly on budget")
    
    return UpdatedCostsResponse(
        concept_id=body.concept_id,
        updated_costs=costs,
        total_lkr=total,
        cost_breakdown_notes=notes,
        venue_cost=venue_cost,
        savings_or_overage=savings_or_overage
    )
