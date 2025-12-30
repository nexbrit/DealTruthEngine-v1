from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.deal import Deal
from app.models.stress_line import StressLine
from app.models.analysis import Analysis
from app.models.evidence import Evidence
from app.ai.client import call_claude
from app.ai.prompts import DECISION_MEMO_SYSTEM, DECISION_MEMO_USER


async def generate_memo(db: Session, deal_id: str) -> str:
    """
    Generate a decision memo for a deal
    """
    # Get deal
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise ValueError("Deal not found")

    # Get stress lines
    stress_lines = db.query(StressLine).filter(StressLine.deal_id == deal_id).all()

    # Get analyses
    analyses = db.query(Analysis).filter(Analysis.deal_id == deal_id).all()

    # Get evidence
    evidence = db.query(Evidence).filter(Evidence.deal_id == deal_id).all()

    # Format stress map
    stress_map = format_stress_map(stress_lines)

    # Format analyses
    analyses_summary = format_analyses(analyses)

    # Format evidence
    evidence_summary = format_evidence(evidence)

    prompt = DECISION_MEMO_USER.format(
        target_company=deal.target_company,
        target_revenue=float(deal.target_revenue) if deal.target_revenue else "Unknown",
        currency=deal.currency,
        stage=deal.stage,
        thesis_summary=deal.thesis_summary or "No thesis provided",
        stress_map=stress_map,
        analyses_summary=analyses_summary,
        evidence_summary=evidence_summary,
    )

    memo = await call_claude(DECISION_MEMO_SYSTEM, prompt)

    return memo


def format_stress_map(stress_lines) -> str:
    """Format stress lines for prompt"""
    lines = []
    for sl in stress_lines:
        flags_str = ", ".join(sl.flags[:3]) if sl.flags else "None"
        lines.append(
            f"- {sl.name}: {sl.status.upper()} (Confidence: {sl.confidence})"
        )
        if sl.summary:
            lines.append(f"  Summary: {sl.summary}")
        if flags_str != "None":
            lines.append(f"  Flags: {flags_str}")
    return "\n".join(lines) if lines else "No stress lines analyzed yet"


def format_analyses(analyses) -> str:
    """Format analyses for prompt"""
    if not analyses:
        return "No analyses completed yet"

    summaries = []
    for a in analyses:
        findings = a.findings or {}
        overall = findings.get("overall_assessment", {})
        summaries.append(
            f"- {a.analysis_type}: {overall.get('status', 'unknown')} - {overall.get('summary', 'No summary')}"
        )

        # Add recommendations
        if a.recommendations:
            for rec in a.recommendations[:2]:
                summaries.append(f"  * {rec}")

    return "\n".join(summaries)


def format_evidence(evidence) -> str:
    """Format evidence for prompt"""
    if not evidence:
        return "No evidence uploaded yet"

    items = []
    for e in evidence:
        items.append(
            f"- {e.original_file_name} ({e.evidence_type or 'unknown type'}) - "
            f"Status: {e.status}, Rows: {e.row_count or 'N/A'}"
        )
    return "\n".join(items)
