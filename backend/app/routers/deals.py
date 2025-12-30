from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.deal import Deal
from app.models.stress_line import StressLine
from app.schemas.deal import DealCreate, DealResponse, DealWithDetails

router = APIRouter()

STRESS_LINE_NAMES = [
    "revenue_quality",
    "margin_utilisation",
    "working_capital",
    "execution_capacity",
    "customer_concentration",
]


@router.post("/", response_model=DealResponse)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    """Create a new deal and initialize stress lines"""
    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.flush()

    # Initialize stress lines
    for name in STRESS_LINE_NAMES:
        stress_line = StressLine(deal_id=db_deal.id, name=name)
        db.add(stress_line)

    db.commit()
    db.refresh(db_deal)
    return db_deal


@router.get("/", response_model=List[DealResponse])
def list_deals(db: Session = Depends(get_db)):
    """List all deals"""
    return db.query(Deal).order_by(Deal.created_at.desc()).all()


@router.get("/{deal_id}", response_model=DealWithDetails)
def get_deal(deal_id: UUID, db: Session = Depends(get_db)):
    """Get deal with all related data"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal


@router.patch("/{deal_id}", response_model=DealResponse)
def update_deal(deal_id: UUID, deal_update: DealCreate, db: Session = Depends(get_db)):
    """Update deal details"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    for key, value in deal_update.model_dump(exclude_unset=True).items():
        setattr(deal, key, value)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}")
def delete_deal(deal_id: UUID, db: Session = Depends(get_db)):
    """Delete a deal"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    db.delete(deal)
    db.commit()
    return {"status": "deleted"}
