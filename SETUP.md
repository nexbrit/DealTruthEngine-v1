# Deal Truth Engine - Setup Guide

This guide provides detailed instructions for setting up and running the Deal Truth Engine (DTE) platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start with Docker](#quick-start-with-docker)
- [Development Setup](#development-setup)
- [Demo Mode](#demo-mode)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Docker** (v20.0+) and **Docker Compose** (v2.0+)
- **Node.js** (v18+) - for local development
- **Python** (v3.10+) - for local development
- **PostgreSQL** (v15+) - or use Docker

### API Keys

- **Anthropic API Key**: Required for AI-powered column mapping and analysis
  - Get one at: https://console.anthropic.com/

---

## Quick Start with Docker

The fastest way to get DTE running:

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd DealTruthEngine-v1

# Create environment file
cp .env.example .env
```

### 2. Add Your API Key

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
DATABASE_URL=postgresql://postgres:postgres@db:5432/dte
```

### 3. Start Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on port 8000
- **Frontend** on port 3000

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

---

## Development Setup

For local development without Docker:

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dte"
export ANTHROPIC_API_KEY="your-key-here"

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variable
export NEXT_PUBLIC_API_URL="http://localhost:8000/api"

# Start development server
npm run dev
```

### Database Setup

If not using Docker, start PostgreSQL:

```bash
# Using Docker for just the database
docker run -d --name dte-postgres \
  -e POSTGRES_DB=dte \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15
```

---

## Demo Mode

DTE includes a fully pre-configured demo deal for presentations and testing.

### Using Demo Mode

1. Open the application at http://localhost:3000
2. Click the **"Try Demo"** button on the home page
3. You'll be redirected to a pre-configured "CloudOps Ltd" deal with:
   - All 5 stress lines pre-analyzed
   - Pipeline, Utilisation, and AR Ageing analyses complete
   - Pre-populated findings and red flags

### Demo Features

The demo deal includes:

| Feature | Description |
|---------|-------------|
| **Stress Map** | All 5 dimensions populated with realistic data |
| **Pipeline Analysis** | 180 opportunities with concentration, velocity, win rate data |
| **Utilisation Analysis** | 65 employees with billable/bench metrics |
| **AR Ageing Analysis** | 80 invoices with DSO and ageing breakdown |
| **Decision Memo** | Pre-generated investment memo with recommendations |

### Quick Demo vs Live AI

On the Memo tab, you have two options:
- **Quick Demo**: Loads pre-generated memo instantly (no API call)
- **Generate with AI**: Creates a new memo using Claude in real-time

### Generating Sample Data Files

To create CSV files for testing uploads:

```bash
cd data
pip install pandas numpy  # if not installed
python generate_demo_data.py
```

This creates:
- `pipeline_export.csv` - CRM pipeline data (180 records)
- `utilisation_export.csv` - Timesheet data (65 employees)
- `ar_ageing_export.csv` - AR data (80 invoices)

---

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `ANTHROPIC_API_KEY` | Claude API key | Required |
| `CLAUDE_MODEL` | Model to use | `claude-sonnet-4-20250514` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `NEXT_PUBLIC_API_URL` | Backend API URL (frontend) | `http://localhost:8000/api` |

### .env.example

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@db:5432/dte

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-sonnet-4-20250514

# File uploads
UPLOAD_DIR=./uploads

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Troubleshooting

### Common Issues

#### Docker Compose Fails to Start

```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose down -v
docker-compose up -d --build
```

#### Database Connection Error

Ensure PostgreSQL is running and the `DATABASE_URL` is correct:

```bash
# Test connection
psql postgresql://postgres:postgres@localhost:5432/dte
```

#### API Key Issues

Verify your Anthropic API key:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

#### Frontend Can't Connect to Backend

1. Check CORS settings in backend
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Ensure backend is running on port 8000

#### File Upload Fails

1. Check `UPLOAD_DIR` exists and is writable
2. Verify file is CSV or Excel format
3. Check file size limits

### Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs
docker-compose logs frontend

# All logs
docker-compose logs -f
```

---

## UI Features Overview

### Home Page
- Deal list with status badges
- "Try Demo" button for instant demo
- Feature showcase grid

### Deal Detail Page
- **Header**: Deal info with demo badge indicator
- **Stress Map**: 5-dimension RAG status with confidence levels
- **Evidence Tab**: File upload, column mapping, analysis trigger
- **Analysis Tab**: View completed analyses with visualizations
- **Memo Tab**: Generate or view AI-powered decision memo

### Analysis Visualizations
- **Concentration Chart**: Pie chart showing pipeline concentration
- **Velocity Chart**: Bar chart comparing stage velocity to benchmarks
- **Win Rate Chart**: Bar chart showing win rates by segment
- **Stuck Deals Table**: List of deals stuck in stages

### Memo Features
- Export to Markdown (.md)
- Print-ready formatting
- Copy to clipboard
- Table rendering for stress summary

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API docs at http://localhost:8000/docs
3. Check backend logs for detailed error messages
