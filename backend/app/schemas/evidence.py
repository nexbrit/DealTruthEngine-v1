from pydantic import BaseModel
from typing import Optional, Dict, List, Any
from uuid import UUID
from datetime import datetime, date


class EvidenceResponse(BaseModel):
    id: UUID
    deal_id: UUID
    file_name: str
    original_file_name: str
    file_type: str
    file_size: Optional[int]
    evidence_type: Optional[str]
    source_system: Optional[str]
    period_start: Optional[date]
    period_end: Optional[date]
    version: int
    status: str
    column_mapping: Optional[Dict[str, Any]]
    row_count: Optional[int]
    notes: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ColumnMappingResponse(BaseModel):
    detected_source_system: str
    confidence: str
    mappings: Dict[str, Optional[str]]
    unmapped_columns: List[str]
    warnings: List[str]
    suggested_evidence_type: str


class ColumnMappingConfirm(BaseModel):
    mappings: Dict[str, Optional[str]]
