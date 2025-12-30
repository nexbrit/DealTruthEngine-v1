from typing import Dict, List
from sqlalchemy.orm import Session
from app.models.stress_line import StressLine
from app.models.analysis import Analysis


def update_stress_map(db: Session, deal_id: str) -> List[Dict]:
    """
    Recalculate stress map based on all analyses for a deal
    """
    # Get all analyses for this deal
    analyses = db.query(Analysis).filter(Analysis.deal_id == deal_id).all()

    # Group by stress line
    stress_updates = {}

    for analysis in analyses:
        stress_name = analysis.stress_line_name
        if not stress_name:
            continue

        if stress_name not in stress_updates:
            stress_updates[stress_name] = {
                "statuses": [],
                "confidences": [],
                "flags": [],
                "summaries": [],
            }

        findings = analysis.findings or {}

        # Extract overall assessment
        if "overall_assessment" in findings:
            assessment = findings["overall_assessment"]
            stress_updates[stress_name]["statuses"].append(
                assessment.get("status", "grey")
            )
            stress_updates[stress_name]["confidences"].append(
                assessment.get("confidence", "none")
            )
            stress_updates[stress_name]["summaries"].append(
                assessment.get("summary", "")
            )

        # Extract red flags
        if "red_flags" in findings:
            stress_updates[stress_name]["flags"].extend(findings["red_flags"])

    # Update stress lines in DB
    results = []
    for name, data in stress_updates.items():
        # Determine overall status (worst case)
        status = calculate_aggregate_status(data["statuses"])
        confidence = calculate_aggregate_confidence(data["confidences"])

        # Upsert stress line
        stress_line = (
            db.query(StressLine)
            .filter(StressLine.deal_id == deal_id, StressLine.name == name)
            .first()
        )

        if not stress_line:
            stress_line = StressLine(deal_id=deal_id, name=name)
            db.add(stress_line)

        stress_line.status = status
        stress_line.confidence = confidence
        stress_line.flags = data["flags"][:10]  # Limit flags
        stress_line.summary = data["summaries"][0] if data["summaries"] else None

        results.append(
            {
                "name": name,
                "status": status,
                "confidence": confidence,
                "flags": stress_line.flags,
                "summary": stress_line.summary,
            }
        )

    db.commit()
    return results


def calculate_aggregate_status(statuses: List[str]) -> str:
    """Aggregate to worst status"""
    if "red" in statuses:
        return "red"
    if "amber" in statuses:
        return "amber"
    if "green" in statuses:
        return "green"
    return "grey"


def calculate_aggregate_confidence(confidences: List[str]) -> str:
    """Aggregate to lowest confidence"""
    priority = {"none": 0, "low": 1, "medium": 2, "high": 3}
    if not confidences:
        return "none"
    min_conf = min(confidences, key=lambda x: priority.get(x, 0))
    return min_conf
