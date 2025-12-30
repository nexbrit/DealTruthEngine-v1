from sqlalchemy import Column, String, Numeric, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    target_company = Column(String(255), nullable=False)
    target_revenue = Column(Numeric(15, 2))
    currency = Column(String(3), default="GBP")
    stage = Column(String(50), default="in_sight")
    thesis_summary = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    evidence = relationship(
        "Evidence", back_populates="deal", cascade="all, delete-orphan"
    )
    stress_lines = relationship(
        "StressLine", back_populates="deal", cascade="all, delete-orphan"
    )
    analyses = relationship(
        "Analysis", back_populates="deal", cascade="all, delete-orphan"
    )
    definitions = relationship(
        "Definition", back_populates="deal", cascade="all, delete-orphan"
    )
