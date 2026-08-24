from sqlalchemy import Column, Integer, Float, String, ForeignKey
from backend.app.database.database import Base


class RecoveryCase(Base):
    __tablename__ = "recovery_cases"

    id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id"),
        nullable=False
    )

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )

    revenue_at_risk = Column(
        Float,
        nullable=False
    )

    risk_level = Column(
        String,
        nullable=False
    )

    diagnosis = Column(
        String,
        nullable=False
    )

    recommended_action = Column(
        String,
        nullable=False
    )

    intervention_action = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="open"
    )