from typing import Dict, Any
import pandas as pd
from app.ai.client import call_claude_json
from app.ai.prompts import UTILISATION_ANALYSIS_SYSTEM, UTILISATION_ANALYSIS_USER


async def analyze_utilisation(
    df: pd.DataFrame,
    deal_context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Run utilisation analysis using Claude
    """
    # Prepare summary stats
    headcount = len(df)

    # Calculate reported utilisation
    if "utilisation_rate" in df.columns:
        reported_util = df["utilisation_rate"].mean()
    elif "billable_hours" in df.columns and "available_hours" in df.columns:
        total_billable = df["billable_hours"].sum()
        total_available = df["available_hours"].sum()
        reported_util = (total_billable / total_available * 100) if total_available > 0 else 0
    else:
        reported_util = 0

    # Get period
    if "period" in df.columns:
        period = f"{df['period'].min()} to {df['period'].max()}"
    else:
        period = "Unknown"

    # Prepare data summary
    utilisation_summary = prepare_utilisation_summary(df)

    prompt = UTILISATION_ANALYSIS_USER.format(
        target_company=deal_context.get("target_company", "Unknown"),
        target_revenue=deal_context.get("target_revenue", "Unknown"),
        currency=deal_context.get("currency", "GBP"),
        headcount=headcount,
        reported_util=f"{reported_util:.1f}",
        period=period,
        utilisation_data=utilisation_summary,
    )

    result = await call_claude_json(UTILISATION_ANALYSIS_SYSTEM, prompt)

    return result


def prepare_utilisation_summary(df: pd.DataFrame) -> str:
    """Prepare utilisation data summary for prompt"""
    summary_parts = []

    # Overall stats
    summary_parts.append("HEADCOUNT SUMMARY:")

    if "role" in df.columns:
        role_dist = df.groupby("role").size().to_string()
        summary_parts.append(f"By Role:\n{role_dist}")

    if "department" in df.columns:
        dept_dist = df.groupby("department").size().to_string()
        summary_parts.append(f"\nBy Department:\n{dept_dist}")

    # Employee type breakdown
    if "is_contractor" in df.columns or "employee_type" in df.columns:
        type_col = "employee_type" if "employee_type" in df.columns else "is_contractor"
        type_dist = df.groupby(type_col).size().to_string()
        summary_parts.append(f"\nBy Type:\n{type_dist}")

    # Hours breakdown
    hour_cols = ["available_hours", "billable_hours", "non_billable_hours", "pto_hours"]
    available_hour_cols = [c for c in hour_cols if c in df.columns]
    if available_hour_cols:
        hours_summary = df[available_hour_cols].sum().to_string()
        summary_parts.append(f"\nTOTAL HOURS:\n{hours_summary}")

    # Utilisation by role
    if "role" in df.columns and "utilisation_rate" in df.columns:
        util_by_role = df.groupby("role")["utilisation_rate"].mean().to_string()
        summary_parts.append(f"\nUTILISATION BY ROLE:\n{util_by_role}")

    # Sample of individual records
    display_cols = ["employee_name", "role", "billable_hours", "available_hours", "utilisation_rate"]
    available_display = [c for c in display_cols if c in df.columns]
    if available_display:
        sample = df[available_display].head(20).to_string()
        summary_parts.append(f"\nSAMPLE DATA:\n{sample}")

    return "\n".join(summary_parts)
