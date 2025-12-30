from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from decimal import Decimal
import uuid

from app.database import get_db
from app.models.deal import Deal
from app.models.stress_line import StressLine
from app.models.analysis import Analysis
from app.schemas.deal import DealResponse

router = APIRouter()

# Pre-baked demo data for CloudOps Ltd
DEMO_DEAL = {
    "name": "CloudOps Ltd Acquisition",
    "target_company": "CloudOps Ltd",
    "target_revenue": Decimal("12500000"),
    "currency": "GBP",
    "stage": "due_diligence",
    "thesis_summary": "UK-based MSP with strong recurring revenue from cloud management services. Target shows promising growth in enterprise segment but needs validation on customer concentration and delivery capacity.",
}

DEMO_STRESS_LINES = {
    "revenue_quality": {
        "status": "amber",
        "confidence": "high",
        "summary": "Pipeline shows 62% concentration in top 10 opportunities. Win rates healthy at 34% but velocity concerns in negotiation stage.",
        "flags": [
            "Top 10 opportunities represent 62% of weighted pipeline value",
            "Average deal velocity 15% slower than industry benchmark",
            "3 deals stuck in negotiation for 90+ days",
        ],
    },
    "margin_utilisation": {
        "status": "amber",
        "confidence": "high",
        "summary": "Billable utilisation at 71% against 75% target. Senior resources over-allocated while junior capacity underutilised.",
        "flags": [
            "Senior consultants at 89% utilisation - potential burnout risk",
            "Junior resources at 58% utilisation - inefficient deployment",
            "Bench costs running £45k/month above target",
        ],
    },
    "working_capital": {
        "status": "red",
        "confidence": "high",
        "summary": "DSO at 67 days, significantly above 45-day target. £890k in 90+ day receivables requires attention.",
        "flags": [
            "Days Sales Outstanding 67 days vs 45-day target",
            "£890,000 in invoices over 90 days overdue",
            "Top 3 customers represent 45% of overdue balance",
            "Collection rate declined 12% YoY",
        ],
    },
    "execution_capacity": {
        "status": "amber",
        "confidence": "medium",
        "summary": "Delivery team stretched with key person dependencies. Project completion rates at 78% vs 90% target.",
        "flags": [
            "2 senior architects responsible for 40% of billable hours",
            "Project overrun rate at 22% - above 10% threshold",
            "No succession planning documented for key roles",
        ],
    },
    "customer_concentration": {
        "status": "red",
        "confidence": "high",
        "summary": "Top 5 customers represent 58% of ARR. Largest customer (TechGiant PLC) at 23% - significant concentration risk.",
        "flags": [
            "TechGiant PLC represents 23% of total ARR",
            "Top 5 customers = 58% of revenue",
            "Only 2 customers with contracts > 24 months",
            "12 of top 20 customers on monthly rolling contracts",
        ],
    },
}

DEMO_PIPELINE_ANALYSIS = {
    "findings": {
        "summary": {
            "total_opportunities": 180,
            "total_pipeline_value": 8234500,
            "weighted_pipeline": 3128910,
            "average_deal_size": 45747,
        },
        "concentration": {
            "top_10_percent_value": 62.3,
            "risk_level": "high",
            "top_opportunities": [
                {"name": "TechGiant Cloud Migration", "value": 450000, "stage": "Negotiation"},
                {"name": "Financial Services Platform", "value": 380000, "stage": "Proposal"},
                {"name": "Healthcare Data Centre", "value": 325000, "stage": "Qualified"},
            ],
        },
        "velocity": {
            "average_days_in_stage": {
                "Prospect": 12,
                "Qualified": 28,
                "Proposal": 35,
                "Negotiation": 52,
                "Closed Won": 0,
            },
            "benchmark_comparison": "15% slower than industry average",
            "stuck_deals": [
                {"name": "Government Framework Deal", "stage": "Negotiation", "days_in_stage": 124},
                {"name": "Retail Chain IT Outsource", "stage": "Negotiation", "days_in_stage": 98},
                {"name": "Insurance Platform Modernisation", "stage": "Proposal", "days_in_stage": 87},
            ],
        },
        "win_rates": {
            "overall": 34.2,
            "by_segment": {
                "Enterprise": 28.5,
                "Mid-Market": 42.1,
                "SMB": 38.7,
            },
            "trend": "Stable YoY, Enterprise segment underperforming",
        },
        "overall_assessment": {
            "risk_level": "medium",
            "confidence": "high",
            "key_concerns": [
                "High concentration in top opportunities creates revenue cliff risk",
                "Negotiation stage bottleneck may indicate pricing or proposal issues",
                "Enterprise win rate below market suggests competitive positioning gaps",
            ],
        },
        "negotiation_levers": [
            "Request customer concentration warranty with earnout protection for TechGiant revenue",
            "Include working capital adjustment mechanism for pipeline conversion delays",
            "Negotiate retention packages for key sales personnel managing large accounts",
        ],
    },
    "recommendations": [
        "Request customer concentration warranty with earnout protection for TechGiant revenue",
        "Include working capital adjustment mechanism for pipeline conversion delays",
        "Negotiate retention packages for key sales personnel managing large accounts",
    ],
    "confidence": "high",
}

DEMO_UTILISATION_ANALYSIS = {
    "findings": {
        "summary": {
            "total_employees": 65,
            "billable_staff": 48,
            "average_utilisation": 71.2,
            "target_utilisation": 75.0,
            "utilisation_gap": -3.8,
        },
        "by_grade": {
            "Senior Consultant": {"utilisation": 89.2, "headcount": 8, "status": "over"},
            "Consultant": {"utilisation": 78.5, "headcount": 18, "status": "on_target"},
            "Junior Consultant": {"utilisation": 58.3, "headcount": 12, "status": "under"},
            "Technical Lead": {"utilisation": 82.1, "headcount": 6, "status": "on_target"},
            "Architect": {"utilisation": 91.5, "headcount": 4, "status": "over"},
        },
        "capacity_issues": {
            "over_utilised_roles": ["Senior Consultant", "Architect"],
            "under_utilised_roles": ["Junior Consultant"],
            "bench_cost_monthly": 45200,
            "burnout_risk_employees": 8,
        },
        "key_person_dependency": {
            "risk_level": "high",
            "critical_employees": [
                {"name": "J. Smith", "role": "Lead Architect", "billable_percent": 18.5},
                {"name": "M. Johnson", "role": "Senior Architect", "billable_percent": 14.2},
            ],
            "concentration_top_2": 32.7,
        },
        "overall_assessment": {
            "risk_level": "medium",
            "confidence": "high",
            "key_concerns": [
                "Senior resources at burnout risk with 89%+ utilisation",
                "Junior talent underutilised, impacting profitability and development",
                "Critical dependency on 2 architects for nearly a third of delivery",
            ],
        },
        "negotiation_levers": [
            "Include key person retention bonuses in deal structure",
            "Request warranties on utilisation rates maintaining above 70%",
            "Negotiate earnout tied to senior staff retention over 24 months",
        ],
    },
    "recommendations": [
        "Include key person retention bonuses in deal structure",
        "Request warranties on utilisation rates maintaining above 70%",
        "Negotiate earnout tied to senior staff retention over 24 months",
    ],
    "confidence": "high",
}

DEMO_AR_ANALYSIS = {
    "findings": {
        "summary": {
            "total_ar_balance": 2340000,
            "current_balance": 890000,
            "overdue_balance": 1450000,
            "dso_days": 67,
            "target_dso": 45,
        },
        "ageing_breakdown": {
            "current": {"amount": 890000, "percent": 38.0},
            "1_30_days": {"amount": 420000, "percent": 17.9},
            "31_60_days": {"amount": 340000, "percent": 14.5},
            "61_90_days": {"amount": 200000, "percent": 8.5},
            "over_90_days": {"amount": 490000, "percent": 20.9},
        },
        "concentration_risk": {
            "top_3_debtors_percent": 45.2,
            "largest_debtor": {
                "name": "TechGiant PLC",
                "balance": 520000,
                "days_overdue": 78,
                "percent_of_total": 22.2,
            },
            "risk_level": "high",
        },
        "collection_trends": {
            "yoy_change": -12.3,
            "average_collection_days": 67,
            "write_off_rate": 2.1,
            "disputed_invoices": 145000,
        },
        "overall_assessment": {
            "risk_level": "high",
            "confidence": "high",
            "key_concerns": [
                "DSO 49% above target indicates systematic collection issues",
                "Over 20% of AR is 90+ days overdue - potential bad debt exposure",
                "Largest customer also largest debtor - relationship risk if pushed on collection",
            ],
        },
        "negotiation_levers": [
            "Request locked box mechanism with AR quality warranty",
            "Negotiate completion accounts with specific bad debt provision",
            "Include earnout protection linked to collection of 90+ day receivables",
            "Consider retention for working capital adjustment post-completion",
        ],
    },
    "recommendations": [
        "Request locked box mechanism with AR quality warranty",
        "Negotiate completion accounts with specific bad debt provision",
        "Include earnout protection linked to collection of 90+ day receivables",
        "Consider retention for working capital adjustment post-completion",
    ],
    "confidence": "high",
}

DEMO_MEMO_CONTENT = """# Investment Decision Memo: CloudOps Ltd Acquisition

## Executive Summary

CloudOps Ltd presents a compelling acquisition opportunity in the UK managed services sector with £12.5M revenue and strong recurring revenue characteristics. However, our analysis has identified **material risks** in three key areas requiring attention before proceeding.

### Overall Assessment: CONDITIONAL PROCEED

The target demonstrates solid fundamentals with 34% win rates and established enterprise relationships. However, significant concentration risks and working capital concerns warrant protective deal structuring.

---

## Stress Map Summary

| Dimension | Status | Confidence | Key Finding |
|-----------|--------|------------|-------------|
| Revenue Quality | 🟡 AMBER | High | 62% pipeline concentration in top 10 opportunities |
| Margin/Utilisation | 🟡 AMBER | High | 71% utilisation vs 75% target; senior burnout risk |
| Working Capital | 🔴 RED | High | DSO 67 days vs 45 target; £890k 90+ overdue |
| Execution Capacity | 🟡 AMBER | Medium | Key person dependencies; 78% completion rate |
| Customer Concentration | 🔴 RED | High | Top customer 23% ARR; top 5 = 58% |

---

## Critical Findings

### 1. Customer Concentration Risk (HIGH)

**Evidence:** TechGiant PLC represents 23% of annual recurring revenue. Top 5 customers account for 58% of total revenue.

**Implication:** Loss of TechGiant would materially impact the investment thesis. The customer is also the largest debtor at £520k overdue.

**Mitigation:** Structure earnout with concentration protections. Consider customer warranty provisions.

### 2. Working Capital Quality (HIGH)

**Evidence:** Days Sales Outstanding at 67 days significantly exceeds the 45-day target. £890,000 in receivables over 90 days overdue.

**Implication:** Actual cash generation may be 15-20% below reported EBITDA. Potential bad debt exposure of 2-4% of AR.

**Mitigation:** Locked box mechanism with specific AR warranties. Retention holdback for collection of aged debt.

### 3. Delivery Capacity Constraints (MEDIUM)

**Evidence:** Two senior architects deliver 32.7% of billable hours. Senior consultants at 89% utilisation.

**Implication:** Burnout risk and single points of failure. Growth may be constrained without additional senior hires.

**Mitigation:** Retention packages for key personnel. Include hiring plan in first 100 days.

---

## Negotiation Recommendations

Based on our analysis, we recommend the following negotiation positions:

### Price Adjustments
1. **Working capital adjustment:** Request completion accounts with normalised working capital target of £1.2M
2. **Bad debt provision:** Include specific provision for 50% of 90+ day receivables (£445k)

### Deal Structure
3. **Earnout protection:** 20% of consideration as earnout tied to:
   - TechGiant contract renewal (10%)
   - Collection of aged receivables (5%)
   - Key person retention (5%)

4. **Retention mechanism:** £300k holdback for 12 months post-completion for AR collection

### Warranties
5. **Customer concentration:** Warranty that no customer represents more than 25% of revenue
6. **Key person:** 24-month service agreements for identified critical employees
7. **Working capital:** Warranty that normalised WC represents no less than 10% of revenue

---

## Due Diligence Focus Areas

Before proceeding, recommend deeper investigation on:

1. **TechGiant relationship:** Contract terms, renewal timeline, decision-maker relationships
2. **AR quality:** Customer-by-customer review of 60+ day balances
3. **Key person interviews:** Assess flight risk and retention requirements
4. **Pricing analysis:** Understand Enterprise segment underperformance

---

## Conclusion

CloudOps Ltd is a viable acquisition target with strong market position and recurring revenue characteristics. The identified risks are manageable through appropriate deal structuring but should not be overlooked.

**Recommendation:** Proceed to final DD phase with focus on customer concentration and AR quality. Prepare for price renegotiation based on working capital findings.

---

*This memo was generated by Deal Truth Engine based on evidence analysis performed on pipeline, utilisation, and AR ageing data. All findings should be validated through traditional due diligence processes.*
"""


@router.post("/seed", response_model=DealResponse)
def seed_demo_data(db: Session = Depends(get_db)):
    """Seed database with demo CloudOps Ltd deal and pre-analysed data"""

    # Check if demo deal already exists
    existing_deal = db.query(Deal).filter(Deal.target_company == "CloudOps Ltd").first()
    if existing_deal:
        return existing_deal

    # Create deal
    deal = Deal(**DEMO_DEAL)
    db.add(deal)
    db.flush()

    # Create stress lines with pre-baked data
    for name, data in DEMO_STRESS_LINES.items():
        stress_line = StressLine(
            deal_id=deal.id,
            name=name,
            status=data["status"],
            confidence=data["confidence"],
            summary=data["summary"],
            flags=data["flags"],
        )
        db.add(stress_line)

    # Create analysis records
    # Pipeline analysis
    pipeline_analysis = Analysis(
        id=uuid.uuid4(),
        deal_id=deal.id,
        stress_line_name="revenue_quality",
        analysis_type="pipeline_analysis",
        findings=DEMO_PIPELINE_ANALYSIS["findings"],
        recommendations=DEMO_PIPELINE_ANALYSIS["recommendations"],
        confidence=DEMO_PIPELINE_ANALYSIS["confidence"],
    )
    db.add(pipeline_analysis)

    # Utilisation analysis
    util_analysis = Analysis(
        id=uuid.uuid4(),
        deal_id=deal.id,
        stress_line_name="margin_utilisation",
        analysis_type="utilisation_analysis",
        findings=DEMO_UTILISATION_ANALYSIS["findings"],
        recommendations=DEMO_UTILISATION_ANALYSIS["recommendations"],
        confidence=DEMO_UTILISATION_ANALYSIS["confidence"],
    )
    db.add(util_analysis)

    # AR analysis
    ar_analysis = Analysis(
        id=uuid.uuid4(),
        deal_id=deal.id,
        stress_line_name="working_capital",
        analysis_type="ar_ageing_analysis",
        findings=DEMO_AR_ANALYSIS["findings"],
        recommendations=DEMO_AR_ANALYSIS["recommendations"],
        confidence=DEMO_AR_ANALYSIS["confidence"],
    )
    db.add(ar_analysis)

    db.commit()
    db.refresh(deal)

    return deal


@router.get("/memo-content")
def get_demo_memo_content():
    """Get pre-baked memo content for demo mode"""
    return {"content": DEMO_MEMO_CONTENT}
