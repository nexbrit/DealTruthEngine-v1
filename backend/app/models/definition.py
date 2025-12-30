from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.database import Base


class Definition(Base):
    __tablename__ = "definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deal_id = Column(UUID(as_uuid=True), ForeignKey("deals.id", ondelete="CASCADE"))
    metric_name = Column(String(100), nullable=False)
    display_name = Column(String(255))
    definition_text = Column(Text)
    calculation_method = Column(Text)
    is_locked = Column(Boolean, default=False)
    locked_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())

    # Relationships
    deal = relationship("Deal", back_populates="definitions")
