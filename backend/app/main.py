from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import deals, evidence, analysis, memo, demo
from app.database import engine
from app.models import Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Deal Truth Engine API",
    description="AI-powered PE due diligence platform",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(deals.router, prefix="/api/deals", tags=["deals"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["evidence"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(memo.router, prefix="/api/memo", tags=["memo"])
app.include_router(demo.router, prefix="/api/demo", tags=["demo"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/")
def root():
    return {
        "name": "Deal Truth Engine API",
        "version": "0.1.0",
        "docs": "/docs",
    }
