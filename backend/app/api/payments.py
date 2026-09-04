from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from backend.app.database.database import get_db
from backend.app.models.payment import Payment
from backend.app.models.invoice import Invoice
from backend.app.models.customer import Customer
from backend.app.api.auth import get_current_user


router = APIRouter(
    prefix="/api/payments",
    tags=["Payments"]
)


# =========================================================
# CREATE PAYMENT
# =========================================================

@router.post("/")
def create_payment(
    customer_id: int,
    invoice_id: int,
    amount: float,
    payment_date: date,
    status: str = "pending",
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # -----------------------------------------------------
    # Check customer
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Check invoice
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Check invoice belongs to customer
    # -----------------------------------------------------

    if invoice.customer_id != customer_id:
        raise HTTPException(
            status_code=400,
            detail="Invoice does not belong to this customer"
        )

    # -----------------------------------------------------
    # Validate payment amount
    # -----------------------------------------------------

    if amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount cannot be negative"
        )

    # -----------------------------------------------------
    # Create payment
    # -----------------------------------------------------

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


# =========================================================
# GET ALL PAYMENTS
# =========================================================

@router.get("/")
def get_payments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    payments = (
        db.query(Payment)
        .order_by(Payment.id.desc())
        .all()
    )

    result = []

    for payment in payments:

        customer = (
            db.query(Customer)
            .filter(Customer.id == payment.customer_id)
            .first()
        )

        customer_name = (
            customer.name
            if customer and hasattr(customer, "name")
            else f"Customer #{payment.customer_id}"
        )

        result.append({
            "payment_id": payment.id,
            "customer_id": payment.customer_id,
            "customer_name": customer_name,
            "invoice_id": payment.invoice_id,
            "amount": payment.amount,
            "payment_date": (
                str(payment.payment_date)
                if payment.payment_date
                else None
            ),
            "status": payment.status
        })

    return {
        "count": len(result),
        "payments": result
    }


# =========================================================
# GET PAYMENT BY ID
# =========================================================

@router.get("/{payment_id}")
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    payment = (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    customer = (
        db.query(Customer)
        .filter(Customer.id == payment.customer_id)
        .first()
    )

    customer_name = (
        customer.name
        if customer and hasattr(customer, "name")
        else f"Customer #{payment.customer_id}"
    )

    return {
        "payment_id": payment.id,
        "customer_id": payment.customer_id,
        "customer_name": customer_name,
        "invoice_id": payment.invoice_id,
        "amount": payment.amount,
        "payment_date": (
            str(payment.payment_date)
            if payment.payment_date
            else None
        ),
        "status": payment.status
    }


# =========================================================
# GET PAYMENT HISTORY FOR INVOICE
# =========================================================

@router.get("/invoice/{invoice_id}")
def get_invoice_payments(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # -----------------------------------------------------
    # Check invoice
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Get payment history
    # -----------------------------------------------------

    payments = (
        db.query(Payment)
        .filter(Payment.invoice_id == invoice_id)
        .order_by(Payment.id.desc())
        .all()
    )

    result = []

    for payment in payments:
        result.append({
            "payment_id": payment.id,
            "customer_id": payment.customer_id,
            "invoice_id": payment.invoice_id,
            "amount": payment.amount,
            "payment_date": (
                str(payment.payment_date)
                if payment.payment_date
                else None
            ),
            "status": payment.status
        })

    # -----------------------------------------------------
    # Payment summary
    # -----------------------------------------------------

    total_paid = sum(
        float(payment.amount or 0)
        for payment in payments
        if str(payment.status).lower() == "success"
    )

    total_payment_attempts = len(payments)

    latest_payment = (
        result[0]
        if result
        else None
    )

    return {
        "invoice_id": invoice_id,
        "invoice_amount": invoice.amount,
        "payment_count": len(result),
        "total_paid": total_paid,
        "total_payment_attempts": total_payment_attempts,
        "latest_payment": latest_payment,
        "payments": result
    }