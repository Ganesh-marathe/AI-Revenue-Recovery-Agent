def diagnose_revenue_problem(
    payment_status,
    risk_level,
    revenue_at_risk
):
    """
    Diagnose why revenue is at risk
    and recommend the next recovery action.
    """

    payment_status = payment_status.lower()
    risk_level = risk_level.upper()

    if payment_status == "failed":
        diagnosis = "Payment attempt failed"

        if risk_level == "HIGH":
            recommended_action = (
                "Retry payment and notify customer"
            )
        else:
            recommended_action = (
                "Monitor payment and contact customer"
            )

    elif payment_status == "pending":
        diagnosis = "Payment is still pending"

        recommended_action = (
            "Send payment reminder to customer"
        )

    elif payment_status == "success":
        diagnosis = "Payment completed successfully"
        recommended_action = "No recovery action required"

    else:
        diagnosis = "Unknown payment condition"
        recommended_action = "Review payment manually"

    return {
        "diagnosis": diagnosis,
        "risk_level": risk_level,
        "revenue_at_risk": revenue_at_risk,
        "recommended_action": recommended_action
    }