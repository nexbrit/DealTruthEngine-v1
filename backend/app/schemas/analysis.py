from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime


class AnalysisRequest(BaseModel):
    evidence_id: UUID
    analysis_type: str


class AnalysisResponse(BaseModel):
    id: UUID
    deal_id: UUID
    evidence_id: Optional[UUID]
    stress_line_name: Optional[str]
    analysis_type: str
    findings: Dict[str, Any]
    recommendations: List[str]
    confidence: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MemoResponse(BaseModel):
    deal_id: UUID
    content: str
    generated_at: datetime
