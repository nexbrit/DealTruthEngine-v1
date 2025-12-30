from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID, uuid4
import shutil
from pathlib import Path

from app.database import get_db
from app.config import get_settings
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceResponse, ColumnMappingResponse, ColumnMappingConfirm
from app.services.file_parser import parse_file
from app.services.column_mapper import auto_map_columns

router = APIRouter()
settings = get_settings()


@router.post("/upload/{deal_id}", response_model=EvidenceResponse)
async def upload_evidence(
    deal_id: UUID,
    file: UploadFile = File(...),
    evidence_type: Optional[str] = Form(None),
    source_system: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload evidence file for a deal"""
    # Validate file type
    allowed_types = [".csv", ".xlsx", ".xls"]
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400, detail=f"File type {file_ext} not supported"
        )

    # Save file
    file_id = uuid4()
    file_name = f"{file_id}{file_ext}"
    file_path = Path(settings.upload_dir) / str(deal_id) / file_name
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse file for metadata
    df, metadata = parse_file(str(file_path))

    # Create evidence record
    evidence = Evidence(
        deal_id=deal_id,
        file_name=file_name,
        original_file_name=file.filename,
        file_type=file_ext,
        file_path=str(file_path),
        file_size=metadata["file_size"],
        evidence_type=evidence_type,
        source_system=source_system,
        row_count=metadata["row_count"],
        status="uploaded",
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return evidence


@router.post("/{evidence_id}/map-columns", response_model=ColumnMappingResponse)
async def map_columns(
    evidence_id: UUID,
    suggested_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Auto-map columns using AI"""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Parse file
    df, _ = parse_file(evidence.file_path)

    # Get AI mapping
    mapping_result = await auto_map_columns(
        df, suggested_type or evidence.evidence_type
    )

    # Update evidence
    evidence.column_mapping = mapping_result.get("mappings", {})
    evidence.evidence_type = mapping_result.get(
        "suggested_evidence_type", evidence.evidence_type
    )
    evidence.source_system = mapping_result.get(
        "detected_source_system", evidence.source_system
    )
    evidence.status = "mapped"

    db.commit()

    return mapping_result


@router.patch("/{evidence_id}/confirm-mapping")
async def confirm_mapping(
    evidence_id: UUID,
    mapping: ColumnMappingConfirm,
    db: Session = Depends(get_db),
):
    """Confirm or modify column mapping"""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    evidence.column_mapping = mapping.mappings
    evidence.status = "mapped"
    db.commit()

    return {"status": "confirmed"}


@router.get("/deal/{deal_id}", response_model=List[EvidenceResponse])
def list_evidence(deal_id: UUID, db: Session = Depends(get_db)):
    """List all evidence for a deal"""
    return (
        db.query(Evidence)
        .filter(Evidence.deal_id == deal_id)
        .order_by(Evidence.uploaded_at.desc())
        .all()
    )


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence(evidence_id: UUID, db: Session = Depends(get_db)):
    """Get specific evidence"""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence


@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: UUID, db: Session = Depends(get_db)):
    """Delete evidence"""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Delete file
    file_path = Path(evidence.file_path)
    if file_path.exists():
        file_path.unlink()

    db.delete(evidence)
    db.commit()
    return {"status": "deleted"}
