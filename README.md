# Deal Truth Engine (DTE)

AI-powered due diligence and post-acquisition monitoring platform for PE deal teams.

## Overview

DTE transforms scattered evidence (CSV exports, Excel files) into structured, confidence-scored analysis that drives negotiation leverage pre-close and faster board decisions post-close.

### Key Features

- **Evidence Upload**: Upload CRM pipeline, utilisation, and AR ageing data
- **AI Column Mapping**: Automatic column detection and mapping using Claude
- **Pipeline Analysis**: Concentration risk, velocity, forecast accuracy
- **Utilisation Analysis**: Definition checking, capacity analysis
- **AR Ageing Analysis**: DSO trends, dispute concentration
- **Stress Map**: Visual RAG status across 5 key dimensions
- **Decision Memo**: AI-generated negotiation recommendations
- **Demo Mode**: Pre-configured demo deal for instant exploration
- **Data Visualizations**: Interactive charts for pipeline metrics

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Python FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **AI**: Anthropic Claude API
- **Containerization**: Docker

> **New to DTE?** See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Anthropic API Key

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd DealTruthEngine-v1
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

3. Start the services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Generate Demo Data

```bash
cd data
python generate_demo_data.py
```

This creates sample CSV files for testing:
- `pipeline_export.csv` - CRM pipeline data
- `utilisation_export.csv` - Utilisation/timesheet data
- `ar_ageing_export.csv` - Accounts receivable data

## Development

### Running Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Database:**
```bash
# Start PostgreSQL
docker run -d --name dte-postgres \
  -e POSTGRES_DB=dte \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

## Project Structure

```
DealTruthEngine-v1/
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── ai/             # Claude AI integration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── main.py         # Application entry
│   └── requirements.txt
├── frontend/               # Next.js application
│   ├── app/               # Pages (App Router)
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   └── types/            # TypeScript types
├── data/                  # Demo data generator
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Deals
- `GET /api/deals` - List all deals
- `POST /api/deals` - Create a deal
- `GET /api/deals/{id}` - Get deal details
- `PATCH /api/deals/{id}` - Update deal

### Evidence
- `POST /api/evidence/upload/{deal_id}` - Upload evidence file
- `POST /api/evidence/{id}/map-columns` - Auto-map columns
- `PATCH /api/evidence/{id}/confirm-mapping` - Confirm mapping
- `GET /api/evidence/deal/{deal_id}` - List evidence

### Analysis
- `POST /api/analysis/pipeline/{evidence_id}` - Run pipeline analysis
- `POST /api/analysis/utilisation/{evidence_id}` - Run utilisation analysis
- `POST /api/analysis/ar-ageing/{evidence_id}` - Run AR analysis
- `GET /api/analysis/deal/{deal_id}` - List analyses

### Memo
- `POST /api/memo/generate/{deal_id}` - Generate decision memo

### Demo
- `POST /api/demo/seed` - Seed demo deal with pre-analyzed data
- `GET /api/demo/memo-content` - Get pre-generated memo content

## Stress Lines

DTE tracks 5 key stress lines:

1. **Revenue Quality** - Pipeline concentration, forecast accuracy
2. **Margin & Utilisation** - Definition accuracy, bench costs
3. **Working Capital** - DSO trends, dispute concentration
4. **Execution Capacity** - Delivery team capability
5. **Customer Concentration** - Revenue concentration risk

Each stress line has:
- **Status**: Green, Amber, Red, Grey
- **Confidence**: High, Medium, Low, None

## Demo Mode

### Quick Demo (No Setup Required)

1. Open http://localhost:3000
2. Click **"Try Demo"** button
3. Explore the pre-configured "CloudOps Ltd" deal with:
   - Pre-analyzed stress map (all 5 dimensions)
   - Pipeline, Utilisation, and AR analyses complete
   - Ready-to-view decision memo

### Full Demo Flow

1. Create a new deal (e.g., "CloudOps Ltd Acquisition")
2. Upload pipeline_export.csv
3. Review AI column mapping and confirm
4. Run pipeline analysis
5. View stress map updates
6. Generate decision memo

### Demo API

- `POST /api/demo/seed` - Create demo deal with pre-analyzed data
- `GET /api/demo/memo-content` - Get pre-generated memo content

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `CLAUDE_MODEL` | Model ID (default: claude-sonnet-4-20250514) | No |
| `UPLOAD_DIR` | File upload directory | No |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## License

Proprietary - All rights reserved
