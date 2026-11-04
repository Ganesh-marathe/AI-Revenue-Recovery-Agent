from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.ml.risk_model import predict_customer_risk

client = TestClient(app)


def test_customer_risk_success():
    response = client.get(
        "/api/analytics/customer-risk",
        params={
            "days_overdue": 45,
            "failed_payment_rate": 0.75,
            "invoice_amount": 50000,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["success"] is True
    assert data["customer_risk"]["risk_level"] == "HIGH"
    assert data["customer_risk"]["risk_score"] == 80


def test_invalid_failed_payment_rate():
    response = client.get(
        "/api/analytics/customer-risk",
        params={
            "days_overdue": 45,
            "failed_payment_rate": 1.5,
            "invoice_amount": 50000,
        },
    )

    assert response.status_code == 422


def test_negative_days_overdue():
    response = client.get(
        "/api/analytics/customer-risk",
        params={
            "days_overdue": -5,
            "failed_payment_rate": 0.5,
            "invoice_amount": 10000,
        },
    )

    assert response.status_code == 422


def test_invalid_invoice_amount():
    response = client.get(
        "/api/analytics/customer-risk",
        params={
            "days_overdue": 10,
            "failed_payment_rate": 0.5,
            "invoice_amount": 0,
        },
    )

    assert response.status_code == 422


def test_high_risk_customer():
    result = predict_customer_risk(
        days_overdue=45,
        failed_payment_rate=0.75,
        invoice_amount=50000,
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] == 80


def test_medium_risk_customer():
    result = predict_customer_risk(
        days_overdue=15,
        failed_payment_rate=0.25,
        invoice_amount=10000,
    )

    assert result["risk_level"] == "MEDIUM"
    assert result["risk_score"] == 40


def test_low_risk_customer():
    result = predict_customer_risk(
        days_overdue=0,
        failed_payment_rate=0.0,
        invoice_amount=5000,
    )

    assert result["risk_level"] == "LOW"
    assert result["risk_score"] == 0