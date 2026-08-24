from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from backend.app.database.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.id"),
        nullable=False
    )

    amount = Column(Float, nullable=False)

    payment_date = Column(Date, nullable=False)

    status = Column(
        String,
        nullable=False,
        default="pending"
    )