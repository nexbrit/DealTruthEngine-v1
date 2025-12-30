from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.deal import Deal
from app.schemas.analysis import MemoResponse
from app.services.memo_generator import generate_memo

router = APIRouter()


@router.post("/generate/{deal_id}", response_model=MemoResponse)
async def create_memo(
    deal_id: UUID,
    db: Session = Depends(get_db),
):
    """Generate decision memo for a deal"""
    # Check deal exists
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    # Generate memo
    content = await generate_memo(db, str(deal_id))

    return MemoResponse(
        deal_id=deal_id,
        content=content,
        generated_at=datetime.utcnow(),
    )
