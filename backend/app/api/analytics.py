from fastapi import APIRouter, HTTPException, Query

from backend.app.ml.risk_model import predict_customer_risk

router = APIRouter()


@router.get("/customer-risk")
def get_customer_risk(
    days_overdue: int = Query(default=45, ge=0),
    failed_payment_rate: float = Query(default=0.75, ge=0, le=1),
    invoice_amount: float = Query(default=50000, gt=0),
):
    """Return validated customer payment risk analytics."""

    try:
        risk_result = predict_customer_risk(
            days_overdue=days_overdue,
            failed_payment_rate=failed_payment_rate,
            invoice_amount=invoice_amount,
        )

        return {
            "success": True,
            "customer_risk": risk_result,
            "customer_metrics": {
                "days_overdue": days_overdue,
                "failed_payment_rate": failed_payment_rate,
                "invoice_amount": invoice_amount,
            },
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc