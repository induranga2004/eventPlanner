# backend-py/src/routes/planner.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import date

from src.config.database import get_db
from src.models.event_planner import EventPlan, PlanCost, PlanTimeline, SelectedPlan
from src.models.campaign import Campaign  # adjust if your Campaign model file name differs

from src.planner.service import (
    generate_costs, compress_milestones, concept_ids,
    pick_title, pick_assumptions, feasibility_notes, uuid
)

router = APIRouter(prefix="/campaigns", tags=["planner"])

# ---------- Schemas (kept local to the router for brevity) ----------
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
    derived: dict

class SelectBody(BaseModel):
    concept_id: str
# -------------------------------------------------------------------

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

    concept_list: List[Concept] = []
    ids = concept_ids(body.number_of_concepts)
    for idx, cid in enumerate(ids):
        title = pick_title(idx)
        assumptions = pick_assumptions(idx)
        # allocate costs
        cost_pairs = generate_costs(body.total_budget_lkr)
        costs = [CostItem(category=c, amount_lkr=v) for c, v in cost_pairs]
        total = sum(c.amount_lkr for c in costs)

        # persist
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

    out = EventPlanOut(
        campaign_id=campaign_id,
        event=event_info,
        concepts=concept_list,
        timeline=[TimelineItem(offset_days=o, milestone=m) for o, m in compress_milestones(event_info.date)],
        derived={"feasibility_notes": feasibility_notes(body.total_budget_lkr, body.attendees_estimate)}
    )
    return out

@router.get("/{campaign_id}/planner/results", response_model=EventPlanOut)
def get_results(campaign_id: str, db: Session = Depends(get_db)):
    plans = db.query(EventPlan).filter(EventPlan.campaign_id == campaign_id).order_by(EventPlan.created_at.desc()).all()
    if not plans:
        raise HTTPException(status_code=404, detail="No plans generated yet")

    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # NOTE: If you persist full event meta separately, reconstruct it here
    event_info = EventInfo(
        name=campaign.title,
        type="wedding",  # fallback if not stored; adjust to your schema
        city=campaign.city,
        venue="",
        date=campaign.date,
        attendees=0,
        audience_profile="",
        notes=""
    )

    concepts: List[Concept] = []
    for p in plans:
        costs = [CostItem(category=c.category, amount_lkr=c.amount_lkr) for c in p.costs]
        concepts.append(
            Concept(
                id=p.concept_key,
                title=p.concept_title,
                assumptions=(p.assumptions.split("|") if p.assumptions else []),
                costs=costs,
                total_lkr=p.total_lkr,
                budget_profile=p.budget_profile
            )
        )

    # take timeline from the latest plan
    timeline = [TimelineItem(offset_days=t.offset_days, milestone=t.milestone) for t in plans[0].timeline]

    return EventPlanOut(
        campaign_id=campaign_id,
        event=event_info,
        concepts=concepts,
        timeline=timeline,
        derived={"feasibility_notes": []}
    )

@router.post("/{campaign_id}/planner/select")
def select_concept(campaign_id: str, body: SelectBody, db: Session = Depends(get_db)):
    plan = db.query(EventPlan).filter(
        EventPlan.campaign_id == campaign_id,
        EventPlan.concept_key == body.concept_id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Concept not found")

    sel = SelectedPlan(id=uuid(), campaign_id=campaign_id, event_plan_id=plan.id)
    db.add(sel)
    db.commit()
    return {"message": "Selected", "campaign_id": campaign_id, "concept_id": body.concept_id, "event_plan_id": plan.id}
