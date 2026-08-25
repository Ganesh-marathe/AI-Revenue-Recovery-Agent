from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.database import get_db
from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.recovery_case import RecoveryCase
from backend.app.services.risk_service import calculate_revenue_risk

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)


@router.get("/revenue-risk")
def revenue_risk(db: Session = Depends(get_db)):

    invoices = db.query(Invoice).all()

    results = []

    total_revenue_at_risk = 0
    high_risk_cases = 0
    medium_risk_cases = 0
    low_risk_cases = 0

    for invoice in invoices:

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

        risk = calculate_revenue_risk(
            invoice.amount,
            payment_amount,
            payment_status
        )

        total_revenue_at_risk += risk["revenue_at_risk"]

        if risk["risk_level"] == "HIGH":
            high_risk_cases += 1
        elif risk["risk_level"] == "MEDIUM":
            medium_risk_cases += 1
        else:
            low_risk_cases += 1

        results.append({
            "invoice_id": invoice.id,
            "customer_id": invoice.customer_id,
            "invoice_amount": invoice.amount,
            "payment_amount": payment_amount,
            "payment_status": payment_status,
            "revenue_at_risk": risk["revenue_at_risk"],
            "risk_level": risk["risk_level"]
        })

    return {
        "total_revenue_at_risk": total_revenue_at_risk,
        "high_risk_cases": high_risk_cases,
        "medium_risk_cases": medium_risk_cases,
        "low_risk_cases": low_risk_cases,
        "cases": results
    }
# ---------------------------------
# Recovery Analytics Summary
# ---------------------------------

@router.get("/summary")
def recovery_summary(
    db: Session = Depends(get_db)
):

    total_cases = (
        db.query(RecoveryCase)
        .count()
    )

    open_cases = (
        db.query(RecoveryCase)
        .filter(
            RecoveryCase.status == "open"
        )
        .count()
    )

    executed_cases = (
        db.query(RecoveryCase)
        .filter(
            RecoveryCase.status == "executed"
        )
        .count()
    )

    high_risk_cases = (
        db.query(RecoveryCase)
        .filter(
            RecoveryCase.risk_level == "HIGH"
        )
        .count()
    )

    total_revenue_at_risk = (
        db.query(
            func.coalesce(
                func.sum(
                    RecoveryCase.revenue_at_risk
                ),
                0
            )
        )
        .scalar()
    )

    return {
        "total_cases": total_cases,
        "open_cases": open_cases,
        "executed_cases": executed_cases,
        "high_risk_cases": high_risk_cases,
        "total_revenue_at_risk": total_revenue_at_risk
    }
# ---------------------------------
# Risk Level Summary
# ---------------------------------

@router.get("/risk-summary")
def risk_summary(
    db: Session = Depends(get_db)
):

    high_risk = (
        db.query(RecoveryCase)
        .filter(RecoveryCase.risk_level == "HIGH")
        .count()
    )

    medium_risk = (
        db.query(RecoveryCase)
        .filter(RecoveryCase.risk_level == "MEDIUM")
        .count()
    )

    low_risk = (
        db.query(RecoveryCase)
        .filter(RecoveryCase.risk_level == "LOW")
        .count()
    )

    return {
        "HIGH": high_risk,
        "MEDIUM": medium_risk,
        "LOW": low_risk
    }