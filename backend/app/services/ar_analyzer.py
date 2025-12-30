from typing import Dict, Any
import pandas as pd
from app.ai.client import call_claude_json
from app.ai.prompts import AR_AGEING_ANALYSIS_SYSTEM, AR_AGEING_ANALYSIS_USER


async def analyze_ar_ageing(
    df: pd.DataFrame,
    deal_context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Run AR ageing analysis using Claude
    """
    # Prepare summary stats
    total_invoices = len(df)

    total_ar = df["amount"].sum() if "amount" in df.columns else 0
    total_outstanding = df["balance"].sum() if "balance" in df.columns else 0

    # Prepare data summary
    ar_summary = prepare_ar_summary(df)

    prompt = AR_AGEING_ANALYSIS_USER.format(
        target_company=deal_context.get("target_company", "Unknown"),
        target_revenue=deal_context.get("target_revenue", "Unknown"),
        currency=deal_context.get("currency", "GBP"),
        total_invoices=total_invoices,
        total_ar=f"{total_ar:,.0f}",
        total_outstanding=f"{total_outstanding:,.0f}",
        ar_data=ar_summary,
    )

    result = await call_claude_json(AR_AGEING_ANALYSIS_SYSTEM, prompt)

    return result


def prepare_ar_summary(df: pd.DataFrame) -> str:
    """Prepare AR data summary for prompt"""
    summary_parts = []

    # Ageing breakdown
    if "ageing_bucket" in df.columns and "balance" in df.columns:
        ageing = df.groupby("ageing_bucket")["balance"].agg(["count", "sum"]).to_string()
        summary_parts.append(f"AGEING BREAKDOWN:\n{ageing}")

    # By customer
    if "customer_name" in df.columns and "balance" in df.columns:
        customer_ar = df.groupby("customer_name")["balance"].sum().nlargest(10).to_string()
        summary_parts.append(f"\nTOP 10 CUSTOMERS BY OUTSTANDING:\n{customer_ar}")

    # Disputes
    if "dispute_flag" in df.columns or "status" in df.columns:
        dispute_col = "dispute_flag" if "dispute_flag" in df.columns else "status"
        if "dispute_flag" in df.columns:
            disputed = df[df["dispute_flag"].isin(["Y", "Yes", True, 1])]
        else:
            disputed = df[df["status"].str.lower() == "disputed"]

        if len(disputed) > 0:
            dispute_summary = disputed.groupby("customer_name")["balance"].sum().to_string()
            summary_parts.append(f"\nDISPUTED BY CUSTOMER:\n{dispute_summary}")

    # Sample records
    display_cols = ["customer_name", "invoice_date", "amount", "balance", "days_outstanding", "ageing_bucket", "status"]
    available_display = [c for c in display_cols if c in df.columns]
    if available_display:
        sample = df[available_display].head(20).to_string()
        summary_parts.append(f"\nSAMPLE DATA:\n{sample}")

    return "\n".join(summary_parts)
