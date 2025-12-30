#!/usr/bin/env python3
"""
Generate synthetic demo data for DTE MVP
Run: python generate_demo_data.py
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

np.random.seed(42)
random.seed(42)

# Configuration
NUM_OPPORTUNITIES = 180
NUM_EMPLOYEES = 65
NUM_INVOICES = 80


def random_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    return start + timedelta(days=random.randint(0, delta.days))


# === PIPELINE DATA ===
def generate_pipeline():
    """Generate CRM pipeline with deliberate red flags"""

    companies = [
        "Acme Corp", "TechFlow Inc", "DataDrive Ltd", "CloudFirst", "InnovateCo",
        "DigitalEdge", "FutureTech", "SmartSystems", "NextGen Solutions", "CoreLogic",
        "Apex Industries", "Prime Technologies", "Summit Group", "Horizon Digital", "Vertex Labs",
        "Quantum Systems", "Atlas Solutions", "Pioneer Tech", "Nexus Corp", "Catalyst Ltd",
        "Enterprise Plus", "Global Dynamics", "Metro Systems", "United Digital", "Sterling Tech"
    ]

    stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Commit", "Closed Won", "Closed Lost"]
    stage_weights = [0.15, 0.2, 0.25, 0.2, 0.1, 0.05, 0.05]

    reps = ["Sarah Chen", "James Wilson", "Emma Thompson", "Michael Brown", "Lisa Garcia", "David Kim"]

    opportunities = []

    for i in range(NUM_OPPORTUNITIES):
        # Create concentration: 3 large customers get disproportionate deals
        if i < 20:
            company = random.choice(companies[:3])  # Top 3 get 20 deals
            amount = random.uniform(150000, 500000)
        elif i < 50:
            company = random.choice(companies[:8])
            amount = random.uniform(80000, 200000)
        else:
            company = random.choice(companies)
            amount = random.uniform(20000, 100000)

        stage = random.choices(stages, weights=stage_weights)[0]

        # Create stuck deals
        if i < 10 and stage in ["Negotiation", "Proposal"]:
            created_date = datetime(2024, 3, 1) + timedelta(days=random.randint(0, 60))
            days_in_stage = random.randint(90, 180)  # Stuck
        else:
            created_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 365))
            days_in_stage = random.randint(10, 60)

        # Rep assignment
        rep = random.choice(reps)

        # Probability
        if stage == "Commit":
            prob = random.randint(85, 95)
        elif stage == "Negotiation":
            prob = random.randint(60, 80)
        elif stage == "Proposal":
            prob = random.randint(30, 50)
        else:
            prob = random.randint(10, 30)

        close_date = created_date + timedelta(days=random.randint(30, 120))

        opportunities.append({
            "Opportunity ID": f"OPP-{i+1:04d}",
            "Opportunity Name": f"{company} - {'Cloud Migration' if i % 3 == 0 else 'Digital Transformation' if i % 3 == 1 else 'Managed Services'}",
            "Account Name": company,
            "Owner": rep,
            "Stage": stage,
            "Amount": round(amount, 2),
            "Close Date": close_date.strftime("%Y-%m-%d"),
            "Created Date": created_date.strftime("%Y-%m-%d"),
            "Probability (%)": prob,
            "Forecast Category": "Commit" if stage == "Commit" else "Best Case" if stage == "Negotiation" else "Pipeline",
            "Type": random.choice(["New Business", "Expansion", "Renewal"]),
            "Days in Stage": days_in_stage,
            "Last Activity": (datetime.now() - timedelta(days=random.randint(1, 45))).strftime("%Y-%m-%d")
        })

    return pd.DataFrame(opportunities)


# === UTILISATION DATA ===
def generate_utilisation():
    """Generate utilisation data with definition mismatch"""

    roles = ["Senior Consultant", "Consultant", "Associate", "Manager", "Senior Manager", "Director"]
    departments = ["Cloud", "Data", "Security", "Applications", "Infrastructure"]

    employees = []

    for i in range(NUM_EMPLOYEES):
        role = random.choices(roles, weights=[0.25, 0.3, 0.2, 0.15, 0.07, 0.03])[0]
        is_contractor = i >= 50  # Last 15 are contractors

        # Create inflated utilisation (includes PTO in denominator)
        if is_contractor:
            available = 40  # Contractors at 40 hrs
            billable = random.uniform(32, 40)
            pto = 0
        else:
            available = 45  # FTEs at 45 hrs
            billable = random.uniform(25, 38)
            pto = random.uniform(2, 6)

        non_billable = max(0, available - billable - pto)

        # Reported util (inflated method)
        reported_util = (billable / available) * 100

        employees.append({
            "Employee ID": f"EMP-{i+1:03d}",
            "Employee Name": f"Employee {i+1}",
            "Role": role,
            "Department": random.choice(departments),
            "Week Ending": "2024-12-22",
            "Available Hours": round(available, 1),
            "Billable Hours": round(billable, 1),
            "Non-Billable Hours": round(non_billable, 1),
            "PTO Hours": round(pto, 1),
            "Utilisation %": round(reported_util, 1),
            "Bill Rate (GBP)": random.randint(80, 200) * 10,
            "Cost Rate (GBP)": random.randint(40, 100) * 10,
            "Employee Type": "Contractor" if is_contractor else "FTE"
        })

    return pd.DataFrame(employees)


# === AR AGEING DATA ===
def generate_ar_ageing():
    """Generate AR ageing with DSO creep pattern"""

    customers = [
        "Acme Corp", "TechFlow Inc", "DataDrive Ltd", "CloudFirst", "InnovateCo",
        "DigitalEdge", "FutureTech", "SmartSystems", "NextGen Solutions", "CoreLogic"
    ]

    invoices = []

    for i in range(NUM_INVOICES):
        customer = random.choice(customers)

        # Create DSO creep - newer invoices have longer outstanding
        invoice_date = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 350))
        days_old = (datetime.now() - invoice_date).days

        # Deliberately create concentration in disputes (3 customers)
        if customer in ["Acme Corp", "TechFlow Inc", "DataDrive Ltd"] and random.random() > 0.6:
            disputed = True
            paid_pct = random.uniform(0, 0.3)
        else:
            disputed = False
            if days_old > 90:
                paid_pct = random.uniform(0.5, 0.9)
            elif days_old > 60:
                paid_pct = random.uniform(0.7, 1.0)
            else:
                paid_pct = random.uniform(0.9, 1.0)

        amount = round(random.uniform(5000, 150000), 2)
        paid = round(amount * paid_pct, 2)
        balance = round(amount - paid, 2)

        # Ageing bucket
        if balance == 0:
            bucket = "Paid"
        elif days_old <= 30:
            bucket = "Current"
        elif days_old <= 60:
            bucket = "31-60"
        elif days_old <= 90:
            bucket = "61-90"
        else:
            bucket = "90+"

        invoices.append({
            "Invoice Number": f"INV-{i+1:04d}",
            "Customer": customer,
            "Invoice Date": invoice_date.strftime("%Y-%m-%d"),
            "Due Date": (invoice_date + timedelta(days=30)).strftime("%Y-%m-%d"),
            "Amount (GBP)": amount,
            "Paid (GBP)": paid,
            "Balance (GBP)": balance,
            "Days Outstanding": days_old,
            "Ageing Bucket": bucket,
            "Status": "Disputed" if disputed else "Outstanding" if balance > 0 else "Paid",
            "Dispute Flag": "Y" if disputed else "N"
        })

    return pd.DataFrame(invoices)


# Generate and save
if __name__ == "__main__":
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))

    print("Generating demo data...")

    pipeline = generate_pipeline()
    pipeline_path = os.path.join(script_dir, "pipeline_export.csv")
    pipeline.to_csv(pipeline_path, index=False)
    print(f"  Pipeline: {len(pipeline)} opportunities -> {pipeline_path}")

    utilisation = generate_utilisation()
    util_path = os.path.join(script_dir, "utilisation_export.csv")
    utilisation.to_csv(util_path, index=False)
    print(f"  Utilisation: {len(utilisation)} employees -> {util_path}")

    ar = generate_ar_ageing()
    ar_path = os.path.join(script_dir, "ar_ageing_export.csv")
    ar.to_csv(ar_path, index=False)
    print(f"  AR Ageing: {len(ar)} invoices -> {ar_path}")

    print("\nDemo data generated successfully!")
    print(f"Files saved to: {script_dir}")
