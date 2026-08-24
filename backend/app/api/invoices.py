from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from backend.app.database.database import get_db
from backend.app.models.invoice import Invoice

router = APIRouter(
    prefix="/api/invoices",
    tags=["Invoices"]
)


@router.post("/")
def create_invoice(
    customer_id: int,
    amount: float,
    due_date: date,
    status: str = "pending",
    db: Session = Depends(get_db)
):
    invoice = Invoice(
        customer_id=customer_id,
        amount=amount,
        due_date=due_date,
        status=status
    )

    db.add(invoice)
    db.commit()
    db.refresh(invoice)

    return {
        "message": "Invoice created successfully!",
        "invoice_id": invoice.id,
        "customer_id": invoice.customer_id,
        "amount": invoice.amount,
        "due_date": str(invoice.due_date),
        "status": invoice.status
    }