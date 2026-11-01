from fastapi.testclient import TestClient

from backend.app.main import app

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
        params={"failed_payment_rate": 1.5},
    )

    assert response.status_code == 422


def test_negative_days_overdue():
    response = client.get(
        "/api/analytics/customer-risk",
        params={"days_overdue": -5},
    )

    assert response.status_code == 422


def test_invalid_invoice_amount():
    response = client.get(
        "/api/analytics/customer-risk",
        params={"invoice_amount": 0},
    )

    assert response.status_code == 422