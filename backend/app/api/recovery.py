from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment

from backend.app.services.risk_service import calculate_revenue_risk
from backend.app.agents.diagnosis_agent import diagnose_revenue_problem
from backend.app.agents.intervention_agent import choose_recovery_action

router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


@router.get("/status")
def recovery_status():
    return {
        "status": "success",
        "message": "Recovery API is working!"
    }


@router.get("/analyze/{invoice_id}")
def analyze_recovery(
    invoice_id: int,
    db: Session = Depends(get_db)
):

    # Find invoice
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


    # Find latest payment
    payment = (
        db.query(Payment)
        .filter(Payment.invoice_id == invoice.id)
        .order_by(Payment.id.desc())
        .first()
    )


    # If payment does not exist
    if payment:
        payment_amount = payment.amount
        payment_status = payment.status
    else:
        payment_amount = 0
        payment_status = "pending"


    # Step 1: Risk Engine
    risk = calculate_revenue_risk(
        invoice.amount,
        payment_amount,
        payment_status
    )


    # Step 2: Diagnosis Agent
    diagnosis = diagnose_revenue_problem(
        payment_status,
        risk["risk_level"],
        risk["revenue_at_risk"]
    )
    intervention = choose_recovery_action(
    payment_status,
    risk["risk_level"],
    risk["revenue_at_risk"]
    )

    # Final response
    return {
        "invoice_id": invoice.id,
        "customer_id": invoice.customer_id,
        "invoice_amount": invoice.amount,
        "payment_amount": payment_amount,
        "payment_status": payment_status,
        "revenue_at_risk": risk["revenue_at_risk"],
        "risk_level": risk["risk_level"],
        "diagnosis": diagnosis["diagnosis"],
        "recommended_action": diagnosis["recommended_action"],
        "intervention_action": intervention["action"],
        "intervention_priority": intervention["priority"],
        "intervention_message": intervention["message"]
    }