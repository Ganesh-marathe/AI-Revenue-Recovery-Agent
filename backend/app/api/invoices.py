from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from backend.app.database.database import get_db
from backend.app.models.invoice import Invoice
from backend.app.models.customer import Customer
from backend.app.api.auth import get_current_user


router = APIRouter(
    prefix="/api/invoices",
    tags=["Invoices"]
)


# =========================================================
# CREATE INVOICE
# =========================================================

@router.post("/")
def create_invoice(
    customer_id: int,
    amount: float,
    due_date: date,
    status: str = "pending",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check whether customer exists
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

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


# =========================================================
# GET ALL INVOICES
# =========================================================

@router.get("/")
def get_invoices(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    invoices = (
        db.query(Invoice)
        .order_by(Invoice.id.desc())
        .all()
    )

    result = []

    for invoice in invoices:

        customer = (
            db.query(Customer)
            .filter(Customer.id == invoice.customer_id)
            .first()
        )

        customer_name = (
            customer.name
            if customer and hasattr(customer, "name")
            else f"Customer #{invoice.customer_id}"
        )

        # Calculate days overdue
        today = date.today()

        if invoice.due_date:
            days_overdue = max(
                (today - invoice.due_date).days,
                0
            )
        else:
            days_overdue = 0

        result.append({
            "invoice_id": invoice.id,
            "customer_id": invoice.customer_id,
            "customer_name": customer_name,
            "amount": invoice.amount,
            "due_date": str(invoice.due_date)
                if invoice.due_date
                else None,
            "days_overdue": days_overdue,
            "status": invoice.status
        })

    return {
        "count": len(result),
        "invoices": result
    }


# =========================================================
# GET SINGLE INVOICE
# =========================================================

@router.get("/{invoice_id}")
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    invoice = (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    customer = (
        db.query(Customer)
        .filter(Customer.id == invoice.customer_id)
        .first()
    )

    customer_name = (
        customer.name
        if customer and hasattr(customer, "name")
        else f"Customer #{invoice.customer_id}"
    )

    # Calculate days overdue
    today = date.today()

    if invoice.due_date:
        days_overdue = max(
            (today - invoice.due_date).days,
            0
        )
    else:
        days_overdue = 0

    return {
        "invoice_id": invoice.id,
        "customer_id": invoice.customer_id,
        "customer_name": customer_name,
        "amount": invoice.amount,
        "due_date": str(invoice.due_date)
            if invoice.due_date
            else None,
        "days_overdue": days_overdue,
        "status": invoice.status
    }