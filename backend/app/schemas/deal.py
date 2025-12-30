from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class DealCreate(BaseModel):
    name: str
    target_company: str
    target_revenue: Optional[Decimal] = None
    currency: Optional[str] = "GBP"
    stage: Optional[str] = "in_sight"
    thesis_summary: Optional[str] = None


class DealResponse(BaseModel):
    id: UUID
    name: str
    target_company: str
    target_revenue: Optional[Decimal]
    currency: str
    stage: str
    thesis_summary: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StressLineResponse(BaseModel):
    id: UUID
    name: str
    status: str
    confidence: str
    summary: Optional[str]
    flags: List[str]

    class Config:
        from_attributes = True


class EvidenceSummary(BaseModel):
    id: UUID
    file_name: str
    original_file_name: str
    file_type: str
    evidence_type: Optional[str]
    status: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class DealWithDetails(DealResponse):
    stress_lines: List[StressLineResponse] = []
    evidence: List[EvidenceSummary] = []

    class Config:
        from_attributes = True
