from datetime import date


def calculate_payment_features(
    days_overdue,
    previous_failed_payments,
    total_previous_payments,
    invoice_amount,
    average_payment_delay=0
):
    """
    Convert payment history into numerical features
    for customer risk analysis.
    """

    values = {
        "days_overdue": days_overdue,
        "previous_failed_payments": previous_failed_payments,
        "total_previous_payments": total_previous_payments,
        "invoice_amount": invoice_amount,
        "average_payment_delay": average_payment_delay,
    }

    for name, value in values.items():
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"{name} must be a number")

        if value < 0:
            raise ValueError(f"{name} cannot be negative")

    if total_previous_payments < previous_failed_payments:
        raise ValueError(
            "Failed payments cannot exceed total previous payments"
        )

    if invoice_amount <= 0:
        raise ValueError("invoice_amount must be greater than zero")

    if not all(
        float(value) == float(value)
        and abs(float(value)) != float("inf")
        for value in values.values()
    ):
        raise ValueError("Features must contain finite numbers")

    if total_previous_payments == 0:
        failed_payment_rate = 0.0
    else:
        failed_payment_rate = (
            previous_failed_payments / total_previous_payments
        )

    return {
        "days_overdue": int(days_overdue),
        "previous_failed_payments": int(previous_failed_payments),
        "total_previous_payments": int(total_previous_payments),
        "failed_payment_rate": round(failed_payment_rate, 4),
        "invoice_amount": round(float(invoice_amount), 2),
        "average_payment_delay": round(float(average_payment_delay), 2),
    }

