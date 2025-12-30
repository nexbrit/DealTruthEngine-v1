from sqlalchemy import Column, String, Integer, Text, DateTime, Date, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id", ondelete="CASCADE"))
    file_name = Column(String(255), nullable=False)
    original_file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    evidence_type = Column(String(100))
    source_system = Column(String(100))
    period_start = Column(Date)
    period_end = Column(Date)
    version = Column(Integer, default=1)
    status = Column(String(50), default="uploaded")
    column_mapping = Column(JSONB)
    row_count = Column(Integer)
    notes = Column(Text)
    uploaded_at = Column(DateTime, default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="evidence")
    analyses = relationship("Analysis", back_populates="evidence")
