from sqlalchemy import Column, String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id", ondelete="CASCADE"))
    evidence_id = Column(
        UUID(as_uuid=True), ForeignKey("evidence.id", ondelete="SET NULL")
    )
    stress_line_name = Column(String(100))
    analysis_type = Column(String(100), nullable=False)
    findings = Column(JSONB, nullable=False)
    recommendations = Column(JSONB, default=[])
    confidence = Column(String(20))
    created_at = Column(DateTime, default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="analyses")
    evidence = relationship("Evidence", back_populates="analyses")
