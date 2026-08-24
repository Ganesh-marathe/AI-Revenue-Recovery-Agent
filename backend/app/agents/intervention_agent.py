def choose_recovery_action(
    payment_status,
    risk_level,
    revenue_at_risk
):
    """
    Select the most appropriate recovery action.
    """

    payment_status = payment_status.lower()
    risk_level = risk_level.upper()

    if payment_status == "failed" and risk_level == "HIGH":
        action = "retry_payment"
        priority = "HIGH"
        message = "Retry the failed payment and notify the customer."

    elif payment_status == "pending":
        action = "send_payment_reminder"
        priority = "MEDIUM"
        message = "Send a payment reminder to the customer."

    elif payment_status == "failed":
        action = "contact_customer"
        priority = "MEDIUM"
        message = "Contact the customer regarding the failed payment."

    elif payment_status == "success":
        action = "no_action"
        priority = "LOW"
        message = "Payment successful. No recovery action required."

    else:
        action = "manual_review"
        priority = "MEDIUM"
        message = "Send the case for manual review."

    return {
        "action": action,
        "priority": priority,
        "revenue_at_risk": revenue_at_risk,
        "message": message
    }