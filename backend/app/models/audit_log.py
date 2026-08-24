from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

from backend.app.database.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    case_id = Column(
        Integer,
        ForeignKey("recovery_cases.id"),
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False
    )

    message = Column(
        String,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
    