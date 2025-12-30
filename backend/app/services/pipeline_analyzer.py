from typing import Dict, Any, Optional
import pandas as pd
from app.ai.client import call_claude_json
from app.ai.prompts import PIPELINE_ANALYSIS_SYSTEM, PIPELINE_ANALYSIS_USER


async def analyze_pipeline(
    df: pd.DataFrame,
    deal_context: Dict[str, Any],
    bookings_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """
    Run comprehensive pipeline analysis using Claude
    """
    # Prepare summary stats
    total_opps = len(df)
    total_value = df["amount"].sum() if "amount" in df.columns else 0

    # Get date range
    if "created_date" in df.columns:
        min_date = df["created_date"].min()
        max_date = df["created_date"].max()
        date_range = f"{min_date} to {max_date}"
    else:
        date_range = "Unknown"

    # Prepare data for prompt (limit rows to avoid token limits)
    pipeline_summary = prepare_pipeline_summary(df)
    bookings_summary = (
        prepare_bookings_summary(bookings_df)
        if bookings_df is not None
        else "Not available"
    )

    prompt = PIPELINE_ANALYSIS_USER.format(
        target_company=deal_context.get("target_company", "Unknown"),
        target_revenue=deal_context.get("target_revenue", "Unknown"),
        currency=deal_context.get("currency", "GBP"),
        thesis_summary=deal_context.get("thesis_summary", "No thesis provided"),
        total_opps=total_opps,
        total_value=f"{total_value:,.0f}",
        date_range=date_range,
        pipeline_data=pipeline_summary,
        bookings_data=bookings_summary,
    )

    result = await call_claude_json(PIPELINE_ANALYSIS_SYSTEM, prompt)

    return result


def prepare_pipeline_summary(df: pd.DataFrame) -> str:
    """Prepare pipeline data summary for prompt"""
    summary_parts = []

    # Top opportunities
    if "amount" in df.columns:
        display_cols = ["opportunity_name", "account_name", "amount", "stage"]
        if "close_date" in df.columns:
            display_cols.append("close_date")
        if "probability" in df.columns:
            display_cols.append("probability")

        available_cols = [c for c in display_cols if c in df.columns]
        top_opps = df.nlargest(15, "amount")[available_cols].to_string()
        summary_parts.append(f"TOP 15 OPPORTUNITIES:\n{top_opps}")

    # Stage distribution
    if "stage" in df.columns and "amount" in df.columns:
        stage_dist = df.groupby("stage")["amount"].agg(["count", "sum"]).to_string()
        summary_parts.append(f"\nSTAGE DISTRIBUTION:\n{stage_dist}")

    # By owner
    if "owner" in df.columns and "amount" in df.columns:
        owner_dist = df.groupby("owner")["amount"].agg(["count", "sum"]).to_string()
        summary_parts.append(f"\nBY OWNER:\n{owner_dist}")

    # By account (concentration)
    if "account_name" in df.columns and "amount" in df.columns:
        account_dist = (
            df.groupby("account_name")["amount"].sum().nlargest(10).to_string()
        )
        summary_parts.append(f"\nTOP 10 ACCOUNTS:\n{account_dist}")

    # Days in stage for stuck deals
    if "days_in_stage" in df.columns:
        stuck = df[df["days_in_stage"] > 60]
        if len(stuck) > 0:
            stuck_summary = stuck[["opportunity_name", "stage", "days_in_stage"]].head(10).to_string()
            summary_parts.append(f"\nPOTENTIALLY STUCK DEALS (>60 days in stage):\n{stuck_summary}")

    return "\n".join(summary_parts)


def prepare_bookings_summary(df: pd.DataFrame) -> str:
    """Prepare historical bookings summary"""
    if df is None or df.empty:
        return "No historical bookings data available"

    # Summarize by period
    if "close_date" in df.columns and "amount" in df.columns:
        df = df.copy()
        df["period"] = pd.to_datetime(df["close_date"]).dt.to_period("M")
        monthly = df.groupby("period")["amount"].sum().to_string()
        return f"MONTHLY BOOKINGS:\n{monthly}"

    return df.head(20).to_string()
