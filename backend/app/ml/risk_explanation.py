def explain_customer_risk(
    days_overdue,
    failed_payment_rate,
    invoice_amount
):
    if days_overdue < 0:
        raise ValueError("Days overdue cannot be negative.")

    if not 0 <= failed_payment_rate <= 1:
        raise ValueError("Failed payment rate must be between 0 and 1.")

    if invoice_amount <= 0:
        raise ValueError("Invoice amount must be positive.")

    factors = []

    if days_overdue > 60:
        factors.append("Payment is overdue by more than 60 days.")
    elif days_overdue > 30:
        factors.append("Payment is overdue by more than 30 days.")
    elif days_overdue > 7:
        factors.append("Payment is overdue by more than 7 days.")

    if failed_payment_rate >= 0.75:
        factors.append("Customer has a very high failed payment rate.")
    elif failed_payment_rate >= 0.50:
        factors.append("Customer has a high failed payment rate.")
    elif failed_payment_rate >= 0.25:
        factors.append("Customer has experienced repeated payment failures.")

    if invoice_amount >= 100000:
        factors.append("A large amount of revenue is at risk.")
    elif invoice_amount >= 50000:
        factors.append("A significant invoice amount is at risk.")

    if not factors:
        factors.append("No major payment risk factors identified.")

    return {
        "total_risk_factors": len(factors),
        "risk_factors": factors,
        "explanation": " ".join(factors)
    }