# Column Mapping Prompt
COLUMN_MAPPING_SYSTEM = """You are an expert data analyst specializing in IT services and B2B company data.
Your task is to analyze CSV/Excel column headers and map them to standard schema fields.

You understand common CRM (Salesforce, HubSpot), PSA (Kantata, OpenAir), and ERP (NetSuite, Sage) exports.

Always respond with valid JSON only, no additional text."""

COLUMN_MAPPING_USER = """Analyze these column headers from a {file_type} export and map them to our standard schema.

COLUMNS FOUND:
{columns}

SAMPLE DATA (first 3 rows):
{sample_data}

STANDARD SCHEMA FOR {evidence_type}:
{schema}

Respond with JSON only:
{{
    "detected_source_system": "Salesforce/HubSpot/NetSuite/Unknown/etc",
    "confidence": "high/medium/low",
    "mappings": {{
        "standard_field_name": "original_column_name",
        ...
    }},
    "unmapped_columns": ["col1", "col2"],
    "warnings": ["any data quality issues noticed"],
    "suggested_evidence_type": "crm_pipeline/utilisation/ar_ageing/etc"
}}
"""

# Pipeline Analysis Prompt
PIPELINE_ANALYSIS_SYSTEM = """You are a PE due diligence expert analyzing CRM pipeline data for an IT services acquisition.

Your goal is to identify risks and red flags that could impact deal valuation or terms. Be specific and quantitative.
Focus on: concentration risk, pipeline velocity, forecast accuracy, deal quality.

Always respond with valid JSON only, no additional text."""

PIPELINE_ANALYSIS_USER = """Analyze this CRM pipeline data for due diligence purposes.

DEAL CONTEXT:
- Target Company: {target_company}
- Revenue: {target_revenue} {currency}
- Thesis: {thesis_summary}

PIPELINE DATA SUMMARY:
- Total Opportunities: {total_opps}
- Total Pipeline Value: {total_value}
- Date Range: {date_range}

DETAILED DATA:
{pipeline_data}

HISTORICAL BOOKINGS (if available):
{bookings_data}

Analyze and respond with JSON only:
{{
    "concentration": {{
        "top_10_value": <number>,
        "top_10_percent": <number>,
        "top_customer_exposure": {{
            "customer": "<name>",
            "value": <number>,
            "percent": <number>
        }},
        "risk_level": "high/medium/low",
        "finding": "<one sentence summary>"
    }},
    "velocity": {{
        "avg_days_by_stage": {{
            "<stage>": <days>,
            ...
        }},
        "stuck_deals": [
            {{"name": "<deal>", "stage": "<stage>", "days_in_stage": <number>}}
        ],
        "risk_level": "high/medium/low",
        "finding": "<one sentence summary>"
    }},
    "forecast_accuracy": {{
        "analyzed_periods": <number>,
        "avg_variance_percent": <number>,
        "pattern": "over-forecasting/under-forecasting/accurate/inconsistent",
        "risk_level": "high/medium/low",
        "finding": "<one sentence summary>"
    }},
    "win_rates": {{
        "overall": <percent>,
        "by_segment": {{"<segment>": <percent>}},
        "by_size": {{"<size_band>": <percent>}},
        "outlier_reps": [
            {{"rep": "<name>", "win_rate": <percent>, "vs_avg": "<+/- X%>"}}
        ],
        "finding": "<one sentence summary>"
    }},
    "red_flags": [
        "<specific red flag 1>",
        "<specific red flag 2>"
    ],
    "overall_assessment": {{
        "status": "green/amber/red",
        "confidence": "high/medium/low",
        "summary": "<2-3 sentence overall assessment>",
        "thesis_impact": "<how this affects the deal thesis>"
    }},
    "negotiation_levers": [
        "<specific negotiation point 1>",
        "<specific negotiation point 2>"
    ],
    "evidence_gaps": [
        "<what additional data would improve confidence>"
    ]
}}
"""

# Utilisation Analysis Prompt
UTILISATION_ANALYSIS_SYSTEM = """You are a PE due diligence expert analyzing utilisation and capacity data for an IT services acquisition.

Focus on: definition accuracy, true vs reported utilisation, bench costs, capacity risks, subcontractor dependency.

Always respond with valid JSON only, no additional text."""

UTILISATION_ANALYSIS_USER = """Analyze this utilisation/timesheet data for due diligence purposes.

DEAL CONTEXT:
- Target Company: {target_company}
- Revenue: {target_revenue} {currency}

UTILISATION DATA SUMMARY:
- Total Headcount: {headcount}
- Reported Utilisation: {reported_util}%
- Period: {period}

DETAILED DATA:
{utilisation_data}

Analyze and respond with JSON only:
{{
    "definition_check": {{
        "reported_method": "<how utilisation appears to be calculated>",
        "standard_method": "billable hours / available hours (excl PTO)",
        "adjustment_needed": true/false,
        "restated_utilisation": <percent or null>,
        "finding": "<explanation of any discrepancy>"
    }},
    "capacity_analysis": {{
        "billable_headcount": <number>,
        "bench_headcount": <number>,
        "bench_cost_estimate": <number>,
        "contractors_percent": <percent>,
        "risk_level": "high/medium/low",
        "finding": "<summary>"
    }},
    "trends": {{
        "direction": "improving/declining/stable",
        "monthly_trend": [<values>],
        "seasonality_noted": true/false,
        "finding": "<summary>"
    }},
    "red_flags": [
        "<specific issue>"
    ],
    "overall_assessment": {{
        "status": "green/amber/red",
        "confidence": "high/medium/low",
        "summary": "<assessment>",
        "margin_impact": "<how this affects margin assumptions>"
    }},
    "negotiation_levers": [
        "<point>"
    ],
    "evidence_gaps": [
        "<what's missing>"
    ]
}}
"""

# AR Ageing Analysis Prompt
AR_AGEING_ANALYSIS_SYSTEM = """You are a PE due diligence expert analyzing accounts receivable and working capital for an IT services acquisition.

Focus on: DSO trends, collection risk, customer concentration in disputes, WIP issues.

Always respond with valid JSON only, no additional text."""

AR_AGEING_ANALYSIS_USER = """Analyze this AR ageing data for due diligence purposes.

DEAL CONTEXT:
- Target Company: {target_company}
- Revenue: {target_revenue} {currency}

AR DATA SUMMARY:
- Total Invoices: {total_invoices}
- Total AR: {total_ar}
- Total Outstanding: {total_outstanding}

DETAILED DATA:
{ar_data}

Analyze and respond with JSON only:
{{
    "dso_analysis": {{
        "current_dso": <days>,
        "trend": "improving/worsening/stable",
        "benchmark_comparison": "<vs industry>",
        "risk_level": "high/medium/low",
        "finding": "<summary>"
    }},
    "ageing_breakdown": {{
        "current_percent": <percent>,
        "30_60_percent": <percent>,
        "60_90_percent": <percent>,
        "over_90_percent": <percent>,
        "risk_level": "high/medium/low",
        "finding": "<summary>"
    }},
    "dispute_concentration": {{
        "total_disputed": <amount>,
        "top_customers_in_dispute": [
            {{"customer": "<name>", "amount": <number>, "percent_of_disputes": <percent>}}
        ],
        "risk_level": "high/medium/low",
        "finding": "<summary>"
    }},
    "red_flags": [
        "<specific issue>"
    ],
    "overall_assessment": {{
        "status": "green/amber/red",
        "confidence": "high/medium/low",
        "summary": "<assessment>",
        "working_capital_impact": "<impact on deal structure>"
    }},
    "negotiation_levers": [
        "<specific point>"
    ],
    "evidence_gaps": [
        "<what's missing>"
    ]
}}
"""

# Decision Memo Prompt
DECISION_MEMO_SYSTEM = """You are a senior PE investment professional writing a deal decision memo.

Write in a direct, evidence-based style. No fluff. Every claim should link to evidence.
The audience is the Investment Committee - they want to know: what's the risk, how confident are we, what should we do about it.

Use markdown formatting for headings and lists."""

DECISION_MEMO_USER = """Generate a Deal Decision Memo based on the following analyses.

DEAL:
- Target: {target_company}
- Revenue: {target_revenue} {currency}
- Stage: {stage}
- Thesis: {thesis_summary}

STRESS MAP CURRENT STATE:
{stress_map}

ANALYSES COMPLETED:
{analyses_summary}

EVIDENCE REGISTER:
{evidence_summary}

Generate a decision memo with these sections:
1. Executive Summary (3-4 sentences)
2. What We Tested (bullet list of analyses run)
3. Key Findings by Stress Line (for each non-green line)
4. Evidence Gaps (what we couldn't verify)
5. Negotiation Levers (specific deal term recommendations)
6. Day-1 Risks (if deal proceeds)
7. Recommendation (proceed/pause/walk, with conditions)

Write in markdown format. Be specific and quantitative. Reference evidence sources.
"""

# Standard Schemas for Column Mapping
SCHEMAS = {
    "crm_pipeline": {
        "opportunity_id": "Unique identifier for the opportunity",
        "opportunity_name": "Name/title of the opportunity",
        "account_name": "Customer/prospect company name",
        "owner": "Sales rep or owner name",
        "stage": "Current pipeline stage",
        "amount": "Deal value/amount",
        "currency": "Currency code",
        "close_date": "Expected close date",
        "created_date": "When opportunity was created",
        "probability": "Win probability percentage",
        "forecast_category": "Forecast category (Commit, Best Case, etc.)",
        "deal_type": "New business, expansion, renewal",
        "source": "Lead source",
        "last_activity_date": "Most recent activity",
    },
    "utilisation": {
        "employee_id": "Unique identifier for employee",
        "employee_name": "Employee name",
        "role": "Job title/role",
        "department": "Department or practice",
        "period": "Time period (week/month)",
        "available_hours": "Total available hours",
        "billable_hours": "Hours billed to clients",
        "non_billable_hours": "Internal/non-billable hours",
        "pto_hours": "Paid time off hours",
        "utilisation_rate": "Calculated utilisation percentage",
        "bill_rate": "Hourly bill rate",
        "cost_rate": "Hourly cost rate",
        "is_contractor": "Whether contractor/subcontractor",
    },
    "ar_ageing": {
        "invoice_id": "Invoice identifier",
        "customer_name": "Customer name",
        "invoice_date": "Date invoice issued",
        "due_date": "Payment due date",
        "amount": "Invoice amount",
        "currency": "Currency code",
        "amount_paid": "Amount paid to date",
        "balance": "Outstanding balance",
        "ageing_bucket": "Ageing category (Current, 30, 60, 90+)",
        "days_outstanding": "Days since invoice",
        "status": "Invoice status",
        "dispute_flag": "Whether disputed",
    },
}
