from datetime import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config.database import get_db
from dependencies.api_key import require_planner_api_key
from models.event_context import EventContext, EventContextRecord

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/event-context",
    tags=["event-context"],
    dependencies=[Depends(require_planner_api_key)],
)


@router.post("/save")
async def save_event_context(
    context: EventContext,
    db: Session = Depends(get_db),
):
    """Persist the event planning context for later poster generation."""

    timestamp = context.timestamp or datetime.utcnow().isoformat()
    payload = context.model_dump()
    payload["timestamp"] = timestamp

    record = (
        db.query(EventContextRecord)
        .filter(EventContextRecord.campaign_id == context.campaign_id)
        .one_or_none()
    )

    if record:
        record.event_name = context.event_name
        record.data = payload
        record.updated_at = datetime.utcnow()
    else:
        record = EventContextRecord(
            campaign_id=context.campaign_id,
            event_name=context.event_name,
            data=payload,
        )
        db.add(record)

    db.commit()

    return {
        "success": True,
        "campaign_id": context.campaign_id,
        "message": "Event context saved successfully",
        "timestamp": timestamp,
    }


@router.get("/{campaign_id}", response_model=EventContext)
async def get_event_context(
    campaign_id: str,
    db: Session = Depends(get_db),
):
    """Return the stored planner context for a campaign."""

    record = (
        db.query(EventContextRecord)
        .filter(EventContextRecord.campaign_id == campaign_id)
        .one_or_none()
    )

    if not record:
        raise HTTPException(status_code=404, detail="Event context not found")

    return EventContext(**record.data)


@router.delete("/{campaign_id}")
async def delete_event_context(
    campaign_id: str,
    db: Session = Depends(get_db),
):
    """Delete a stored planner context."""

    deleted = (
        db.query(EventContextRecord)
        .filter(EventContextRecord.campaign_id == campaign_id)
        .delete()
    )

    if not deleted:
        raise HTTPException(status_code=404, detail="Context not found")

    db.commit()
    return {"success": True, "message": "Context deleted"}


@router.get("/")
async def list_event_contexts(db: Session = Depends(get_db)):
    """List stored contexts for debugging purposes."""

    records = db.query(EventContextRecord).all()
    return {
        "count": len(records),
        "contexts": [
            {
                "campaign_id": record.campaign_id,
                "event_name": record.event_name,
                "timestamp": (record.data or {}).get("timestamp"),
            }
            for record in records
        ],
    }
