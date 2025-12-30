from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.evidence import Evidence
from app.models.analysis import Analysis
from app.models.deal import Deal
from app.schemas.analysis import AnalysisResponse
from app.services.file_parser import parse_file, clean_dataframe
from app.services.pipeline_analyzer import analyze_pipeline
from app.services.utilisation_analyzer import analyze_utilisation
from app.services.ar_analyzer import analyze_ar_ageing
from app.services.stress_calculator import update_stress_map

router = APIRouter()


@router.post("/pipeline/{evidence_id}", response_model=AnalysisResponse)
async def run_pipeline_analysis(
    evidence_id: UUID,
    db: Session = Depends(get_db),
):
    """Run pipeline analysis on evidence file"""
    # Get evidence
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not evidence.column_mapping:
        raise HTTPException(
            status_code=400, detail="Column mapping required before analysis"
        )

    # Get deal context
    deal = db.query(Deal).filter(Deal.id == evidence.deal_id).first()
    deal_context = {
        "target_company": deal.target_company,
        "target_revenue": float(deal.target_revenue) if deal.target_revenue else None,
        "currency": deal.currency,
        "thesis_summary": deal.thesis_summary,
    }

    # Parse and clean data
    df, _ = parse_file(evidence.file_path)
    df_clean = clean_dataframe(df, evidence.column_mapping)

    # Run analysis
    findings = await analyze_pipeline(df_clean, deal_context)

    # Determine stress lines to update
    stress_lines = ["revenue_quality"]
    if findings.get("concentration", {}).get("risk_level") == "high":
        stress_lines.append("customer_concentration")

    # Save analysis
    analysis = Analysis(
        deal_id=evidence.deal_id,
        evidence_id=evidence_id,
        stress_line_name=stress_lines[0],
        analysis_type="pipeline_analysis",
        findings=findings,
        recommendations=findings.get("negotiation_levers", []),
        confidence=findings.get("overall_assessment", {}).get("confidence", "medium"),
    )
    db.add(analysis)

    # Update evidence status
    evidence.status = "analyzed"

    db.commit()
    db.refresh(analysis)

    # Update stress map
    update_stress_map(db, str(evidence.deal_id))

    return analysis


@router.post("/utilisation/{evidence_id}", response_model=AnalysisResponse)
async def run_utilisation_analysis(
    evidence_id: UUID,
    db: Session = Depends(get_db),
):
    """Run utilisation analysis on evidence file"""
    # Get evidence
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not evidence.column_mapping:
        raise HTTPException(
            status_code=400, detail="Column mapping required before analysis"
        )

    # Get deal context
    deal = db.query(Deal).filter(Deal.id == evidence.deal_id).first()
    deal_context = {
        "target_company": deal.target_company,
        "target_revenue": float(deal.target_revenue) if deal.target_revenue else None,
        "currency": deal.currency,
        "thesis_summary": deal.thesis_summary,
    }

    # Parse and clean data
    df, _ = parse_file(evidence.file_path)
    df_clean = clean_dataframe(df, evidence.column_mapping)

    # Run analysis
    findings = await analyze_utilisation(df_clean, deal_context)

    # Save analysis
    analysis = Analysis(
        deal_id=evidence.deal_id,
        evidence_id=evidence_id,
        stress_line_name="margin_utilisation",
        analysis_type="utilisation_analysis",
        findings=findings,
        recommendations=findings.get("negotiation_levers", []),
        confidence=findings.get("overall_assessment", {}).get("confidence", "medium"),
    )
    db.add(analysis)

    # Update evidence status
    evidence.status = "analyzed"

    db.commit()
    db.refresh(analysis)

    # Update stress map
    update_stress_map(db, str(evidence.deal_id))

    return analysis


@router.post("/ar-ageing/{evidence_id}", response_model=AnalysisResponse)
async def run_ar_analysis(
    evidence_id: UUID,
    db: Session = Depends(get_db),
):
    """Run AR ageing analysis on evidence file"""
    # Get evidence
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    if not evidence.column_mapping:
        raise HTTPException(
            status_code=400, detail="Column mapping required before analysis"
        )

    # Get deal context
    deal = db.query(Deal).filter(Deal.id == evidence.deal_id).first()
    deal_context = {
        "target_company": deal.target_company,
        "target_revenue": float(deal.target_revenue) if deal.target_revenue else None,
        "currency": deal.currency,
        "thesis_summary": deal.thesis_summary,
    }

    # Parse and clean data
    df, _ = parse_file(evidence.file_path)
    df_clean = clean_dataframe(df, evidence.column_mapping)

    # Run analysis
    findings = await analyze_ar_ageing(df_clean, deal_context)

    # Save analysis
    analysis = Analysis(
        deal_id=evidence.deal_id,
        evidence_id=evidence_id,
        stress_line_name="working_capital",
        analysis_type="ar_ageing_analysis",
        findings=findings,
        recommendations=findings.get("negotiation_levers", []),
        confidence=findings.get("overall_assessment", {}).get("confidence", "medium"),
    )
    db.add(analysis)

    # Update evidence status
    evidence.status = "analyzed"

    db.commit()
    db.refresh(analysis)

    # Update stress map
    update_stress_map(db, str(evidence.deal_id))

    return analysis


@router.get("/deal/{deal_id}", response_model=List[AnalysisResponse])
def list_analyses(deal_id: UUID, db: Session = Depends(get_db)):
    """List all analyses for a deal"""
    return (
        db.query(Analysis)
        .filter(Analysis.deal_id == deal_id)
        .order_by(Analysis.created_at.desc())
        .all()
    )


@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: UUID, db: Session = Depends(get_db)):
    """Get specific analysis"""
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis
