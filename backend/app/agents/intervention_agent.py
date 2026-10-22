def choose_recovery_action(
    payment_status,
    risk_level,
    revenue_at_risk
):
    """
    Recommend a recovery action based on payment status,
    customer risk level, and revenue at risk.
    """

    payment_status = str(payment_status).strip().lower()
    risk_level = str(risk_level).strip().upper()

    try:
        revenue_at_risk = float(revenue_at_risk)
    except (TypeError, ValueError):
        raise ValueError("revenue_at_risk must be a valid number")

    if revenue_at_risk < 0:
        raise ValueError("revenue_at_risk cannot be negative")

    if payment_status == "success":
        action = "no_action"
        priority = "LOW"
        message = "Payment successful. No recovery action required."
        reason = "The payment has already been completed."

    elif payment_status == "failed" and risk_level == "HIGH":
        action = "retry_payment"
        priority = "HIGH"
        message = "Retry the failed payment and notify the customer."
        reason = "The payment failed and the customer has high risk."

    elif payment_status == "failed" and risk_level == "MEDIUM":
        action = "contact_customer"
        priority = "MEDIUM"
        message = "Contact the customer to resolve the failed payment."
        reason = "The payment failed and customer follow-up is appropriate."

    elif payment_status == "failed":
        action = "review_failed_payment"
        priority = "MEDIUM"
        message = "Review the failed payment before taking further action."
        reason = "The payment failed and requires investigation."

    elif payment_status == "pending" and risk_level == "HIGH":
        action = "urgent_payment_reminder"
        priority = "HIGH"
        message = "Send an urgent payment reminder to the customer."
        reason = "The payment is pending and the customer has high risk."

    elif payment_status == "pending":
        action = "send_payment_reminder"
        priority = "MEDIUM"
        message = "Send a payment reminder to the customer."
        reason = "The payment has not yet been completed."

    else:
        action = "manual_review"
        priority = "MEDIUM"
        message = "Send the case for manual review."
        reason = "The payment status is not recognized."

    return {
        "action": action,
        "priority": priority,
        "revenue_at_risk": revenue_at_risk,
        "message": message,
        "reason": reason,
        "payment_status": payment_status,
        "risk_level": risk_level
    }
