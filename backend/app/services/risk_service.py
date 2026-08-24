def calculate_revenue_risk(invoice_amount, payment_amount, payment_status):
    """
    Calculate revenue at risk and risk level.
    """

    revenue_at_risk = max(invoice_amount - payment_amount, 0)

    if payment_status.lower() == "failed":
        risk_level = "HIGH"

    elif payment_status.lower() == "pending":
        risk_level = "MEDIUM"

    elif revenue_at_risk > 0:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    return {
        "invoice_amount": invoice_amount,
        "payment_amount": payment_amount,
        "revenue_at_risk": revenue_at_risk,
        "risk_level": risk_level
    }