from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.recovery_case import RecoveryCase

from backend.app.services.risk_service import calculate_revenue_risk
from backend.app.agents.diagnosis_agent import diagnose_revenue_problem
from backend.app.agents.intervention_agent import choose_recovery_action


router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


# ---------------------------------
# Recovery API Status
# ---------------------------------

@router.get("/status")
def recovery_status():
    return {
        "status": "success",
        "message": "Recovery API is working!"
    }


# ---------------------------------
# Analyze Recovery
# ---------------------------------

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

    if payment:
        payment_amount = payment.amount
        payment_status = payment.status
    else:
        payment_amount = 0
        payment_status = "pending"

    # Risk Engine
    risk = calculate_revenue_risk(
        invoice.amount,
        payment_amount,
        payment_status
    )

    # Diagnosis Agent
    diagnosis = diagnose_revenue_problem(
        payment_status,
        risk["risk_level"],
        risk["revenue_at_risk"]
    )

    # Intervention Agent
    intervention = choose_recovery_action(
        payment_status,
        risk["risk_level"],
        risk["revenue_at_risk"]
    )

    # Check existing recovery case
    existing_case = (
        db.query(RecoveryCase)
        .filter(
            RecoveryCase.invoice_id == invoice.id,
            RecoveryCase.status == "open"
        )
        .first()
    )

    if existing_case:
        recovery_case = existing_case

    else:
        recovery_case = RecoveryCase(
            invoice_id=invoice.id,
            customer_id=invoice.customer_id,
            revenue_at_risk=risk["revenue_at_risk"],
            risk_level=risk["risk_level"],
            diagnosis=diagnosis["diagnosis"],
            recommended_action=diagnosis["recommended_action"],
            intervention_action=intervention["action"],
            status="open"
        )

        db.add(recovery_case)
        db.commit()
        db.refresh(recovery_case)

    return {
        "case_id": recovery_case.id,
        "case_status": recovery_case.status,
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


# ---------------------------------
# Get All Recovery Cases
# ---------------------------------

@router.get("/cases")
def get_recovery_cases(
    db: Session = Depends(get_db)
):

    cases = (
        db.query(RecoveryCase)
        .order_by(RecoveryCase.id.desc())
        .all()
    )

    return {
        "count": len(cases),
        "cases": [
            {
                "case_id": case.id,
                "invoice_id": case.invoice_id,
                "customer_id": case.customer_id,
                "revenue_at_risk": case.revenue_at_risk,
                "risk_level": case.risk_level,
                "diagnosis": case.diagnosis,
                "recommended_action": case.recommended_action,
                "intervention_action": case.intervention_action,
                "status": case.status
            }
            for case in cases
        ]
    }