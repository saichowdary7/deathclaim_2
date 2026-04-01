from sqlalchemy import Column, String, BigInteger, Text, DateTime
from sqlalchemy.sql import func
from src.models.base import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)

    table_name = Column(String(100), nullable=False)
    record_id = Column(BigInteger, nullable=False)
    action_type = Column(String(20), nullable=False)

    old_values = Column(Text)
    new_values = Column(Text)
    changed_fields = Column(Text)

    acted_by = Column(String(100), nullable=False)
    acted_at = Column(DateTime, default=func.now())

    session_id = Column(String(100))
    ip_address = Column(String(50))
    claim_id = Column(BigInteger)
    notes = Column(Text)