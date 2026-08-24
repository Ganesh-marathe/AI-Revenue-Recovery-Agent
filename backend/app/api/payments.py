from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from backend.app.database.database import get_db
from backend.app.models.payment import Payment

router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


@router.post("/")
def create_payment(
    customer_id: int,
    invoice_id: int,
    amount: float,
    payment_date: date,
    status: str = "pending",
    db: Session = Depends(get_db)
):
    payment = Payment(
        customer_id=customer_id,
        invoice_id=invoice_id,
        amount=amount,
        payment_date=payment_date,
        status=status
    )

    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "Payment created successfully!",
        "payment_id": payment.id,
        "customer_id": payment.customer_id,
        "invoice_id": payment.invoice_id,
        "amount": payment.amount,
        "payment_date": str(payment.payment_date),
        "status": payment.status
    }