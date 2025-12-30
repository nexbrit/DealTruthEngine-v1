from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class StressLine(Base):
    __tablename__ = "stress_lines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id", ondelete="CASCADE"))
    name = Column(String(100), nullable=False)
    status = Column(String(20), default="grey")
    confidence = Column(String(20), default="none")
    summary = Column(Text)
    flags = Column(JSONB, default=[])
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="stress_lines")
