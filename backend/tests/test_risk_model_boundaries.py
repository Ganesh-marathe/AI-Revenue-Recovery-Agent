import pytest

from backend.app.ml.risk_model import predict_customer_risk


def test_low_risk_customer():
    result = predict_customer_risk(
        days_overdue=0,
        failed_payment_rate=0.0,
        invoice_amount=5000,
    )

    assert result["risk_level"] == "LOW"
    assert result["risk_score"] == 0


def test_medium_risk_customer():
    result = predict_customer_risk(
        days_overdue=15,
        failed_payment_rate=0.25,
        invoice_amount=10000,
    )

    assert result["risk_level"] == "MEDIUM"
    assert result["risk_score"] == 40


def test_high_risk_customer():
    result = predict_customer_risk(
        days_overdue=45,
        failed_payment_rate=0.75,
        invoice_amount=50000,
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] == 80


def test_very_high_risk_customer():
    result = predict_customer_risk(
        days_overdue=90,
        failed_payment_rate=1.0,
        invoice_amount=150000,
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] == 100


def test_invalid_negative_invoice():
    with pytest.raises(ValueError):
        predict_customer_risk(
            days_overdue=10,
            failed_payment_rate=0.5,
            invoice_amount=-1000,
        )


def test_invalid_payment_rate():
    with pytest.raises(ValueError):
        predict_customer_risk(
            days_overdue=10,
            failed_payment_rate=1.5,
            invoice_amount=10000,
        )