from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from backend.app.database.database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.id"),
        nullable=False
    )

    amount = Column(Float, nullable=False)

    due_date = Column(Date, nullable=False)

    status = Column(String, nullable=False, default="pending")