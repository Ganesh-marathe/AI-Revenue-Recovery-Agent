def calculate_revenue_risk(invoice_amount, payment_amount, payment_status):
    """
    Calculate actual revenue at risk based on payment status.
    """

    status = payment_status.lower()

    if status == "success":
        revenue_at_risk = 0
        risk_level = "LOW"

    elif status == "failed":
        revenue_at_risk = invoice_amount
        risk_level = "HIGH"

    elif status == "pending":
        revenue_at_risk = max(invoice_amount - payment_amount, 0)

        if revenue_at_risk > 0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

    else:
        revenue_at_risk = max(invoice_amount - payment_amount, 0)
        risk_level = "MEDIUM"

    return {
        "invoice_amount": invoice_amount,
        "payment_amount": payment_amount,
        "revenue_at_risk": revenue_at_risk,
        "risk_level": risk_level
    }