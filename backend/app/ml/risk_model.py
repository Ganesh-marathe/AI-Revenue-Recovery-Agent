def predict_customer_risk(
    days_overdue,
    failed_payment_rate,
    invoice_amount,
):
    """
    Predict customer payment risk using payment history.

    Returns:
        risk_level: LOW, MEDIUM, or HIGH
        risk_score: Score between 0 and 100
        recommendation: Suggested recovery action
    """

    if days_overdue < 0:
        raise ValueError("Days overdue cannot be negative.")

    if not 0 <= failed_payment_rate <= 1:
        raise ValueError(
            "Failed payment rate must be between 0 and 1."
        )

    if invoice_amount <= 0:
        raise ValueError("Invoice amount must be positive.")

    risk_score = 0

    # Check overdue days
    if days_overdue > 60:
        risk_score += 50
    elif days_overdue > 30:
        risk_score += 35
    elif days_overdue > 7:
        risk_score += 20
    elif days_overdue > 0:
        risk_score += 10

    # Check failed payment history
    if failed_payment_rate >= 0.75:
        risk_score += 30
    elif failed_payment_rate >= 0.50:
        risk_score += 20
    elif failed_payment_rate >= 0.25:
        risk_score += 10

    # Check invoice amount
    if invoice_amount >= 100000:
        risk_score += 20
    elif invoice_amount >= 50000:
        risk_score += 15
    elif invoice_amount >= 10000:
        risk_score += 10

    # Keep score between 0 and 100
    risk_score = min(risk_score, 100)

    # Determine risk level
    if risk_score >= 60:
        risk_level = "HIGH"
        recommendation = "Contact customer and prioritize recovery."

    elif risk_score >= 30:
        risk_level = "MEDIUM"
        recommendation = "Send payment reminder and monitor customer."

    else:
        risk_level = "LOW"
        recommendation = "Send regular payment reminder."

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "recommendation": recommendation,
    }