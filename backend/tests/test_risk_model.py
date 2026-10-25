import pytest

from backend.app.ml.risk_model import predict_customer_risk


def test_high_risk_customer():
    result = predict_customer_risk(
        days_overdue=45,
        failed_payment_rate=0.75,
        invoice_amount=50000,
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] == 85


def test_medium_risk_customer():
    result = predict_customer_risk(
        days_overdue=15,
        failed_payment_rate=0.25,
        invoice_amount=10000,
    )

    assert result["risk_level"] == "MEDIUM"
    assert result["risk_score"] == 30


def test_low_risk_customer():
    result = predict_customer_risk(
        days_overdue=0,
        failed_payment_rate=0,
        invoice_amount=5000,
    )

    assert result["risk_level"] == "LOW"
    assert result["risk_score"] == 0


def test_negative_days_overdue():
    with pytest.raises(ValueError):
        predict_customer_risk(
            days_overdue=-5,
            failed_payment_rate=0.5,
            invoice_amount=10000,
        )


def test_invalid_failed_payment_rate():
    with pytest.raises(ValueError):
        predict_customer_risk(
            days_overdue=10,
            failed_payment_rate=1.5,
            invoice_amount=10000,
        )