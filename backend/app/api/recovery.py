from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.database import get_db
from backend.app.api.auth import get_current_user

from backend.app.models.invoice import Invoice
from backend.app.models.payment import Payment
from backend.app.models.recovery_case import RecoveryCase
from backend.app.models.audit_log import AuditLog

from backend.app.services.risk_service import calculate_revenue_risk
from backend.app.agents.diagnosis_agent import diagnose_revenue_problem
from backend.app.agents.intervention_agent import choose_recovery_action


router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


# =========================================================
# Recovery API Status
# =========================================================

@router.get("/status")
def recovery_status():
    """
    Public health/status endpoint.
    """

    return {
        "status": "success",
        "message": "Recovery API is working!"
    }


# =========================================================
# Analyze Recovery
# =========================================================

@router.get("/analyze/{invoice_id}")
def analyze_recovery(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Analyze an invoice using:
    1. Revenue Risk Engine
    2. Diagnosis Agent
    3. Intervention Agent

    Creates an open recovery case if one does not already exist.
    """

    # -----------------------------------------------------
    # 1. Find Invoice
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
    # 2. Find Latest Payment
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 3. Revenue Risk Engine
    # -----------------------------------------------------

    risk = calculate_revenue_risk(
        invoice.amount,
        payment_amount,
        payment_status
    )

    # -----------------------------------------------------
    # 4. Diagnosis Agent
    # -----------------------------------------------------

    diagnosis = diagnose_revenue_problem(
        payment_status,
        risk["risk_level"],
        risk["revenue_at_risk"]
    )

    # -----------------------------------------------------
    # 5. Intervention Agent
    # -----------------------------------------------------

    intervention = choose_recovery_action(
        payment_status,
        risk["risk_level"],
        risk["revenue_at_risk"]
    )

    # -----------------------------------------------------
    # 6. Check Existing Open Recovery Case
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # 7. Return Recovery Analysis
    # -----------------------------------------------------

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


# =========================================================
# Execute Recovery Action
# =========================================================

@router.post("/cases/{case_id}/execute")
def execute_recovery_action(
    case_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Execute the AI-selected recovery action for a case.

    Current implementation simulates the external action
    and records the execution in the audit log.
    """

    # -----------------------------------------------------
    # 1. Find Recovery Case
    # -----------------------------------------------------

    recovery_case = (
        db.query(RecoveryCase)
        .filter(RecoveryCase.id == case_id)
        .first()
    )

    if not recovery_case:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found"
        )

    # -----------------------------------------------------
    # 2. Check Case Status
    # -----------------------------------------------------

    if recovery_case.status != "open":
        raise HTTPException(
            status_code=400,
            detail="Recovery case is not open"
        )

    # -----------------------------------------------------
    # 3. Get AI Recommended Action
    # -----------------------------------------------------

    action = recovery_case.intervention_action

    # -----------------------------------------------------
    # 4. Execute Recovery Action
    # -----------------------------------------------------

    if action == "retry_payment":

        execution_message = (
            "Payment retry requested successfully."
        )

    elif action == "send_payment_reminder":

        execution_message = (
            "Payment reminder sent successfully."
        )

    elif action == "contact_customer":

        execution_message = (
            "Customer contact action created successfully."
        )

    elif action == "no_action":

        execution_message = (
            "No recovery action required."
        )

    else:

        execution_message = (
            "Recovery action sent for manual review."
        )

    # -----------------------------------------------------
    # 5. Update Recovery Case
    # -----------------------------------------------------

    recovery_case.status = "executed"

    # -----------------------------------------------------
    # 6. Create Audit Log
    # -----------------------------------------------------

    audit_log = AuditLog(
        case_id=recovery_case.id,
        action=action,
        status="executed",
        message=execution_message
    )

    db.add(audit_log)

    # -----------------------------------------------------
    # 7. Save Database Changes
    # -----------------------------------------------------

    db.commit()
    db.refresh(recovery_case)

    # -----------------------------------------------------
    # 8. Return Execution Result
    # -----------------------------------------------------

    return {
        "message": "Recovery action executed successfully!",

        "case_id": recovery_case.id,

        "action": action,

        "status": recovery_case.status,

        "execution_message": execution_message
    }


# =========================================================
# Get Audit Logs
# =========================================================

@router.get("/audit-logs")
def get_audit_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Return recovery activity and audit history.
    """

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .all()
    )

    return {
        "count": len(logs),

        "logs": [
            {
                "log_id": log.id,
                "case_id": log.case_id,
                "action": log.action,
                "status": log.status,
                "message": log.message,
                "created_at": log.created_at
            }

            for log in logs
        ]
    }