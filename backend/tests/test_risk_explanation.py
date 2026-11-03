from backend.app.ml.risk_explanation import explain_customer_risk


def test_high_risk_explanation():
    result = explain_customer_risk(45, 0.75, 50000)

    assert result["total_risk_factors"] == 3
    assert len(result["risk_factors"]) == 3
    assert "overdue by more than 30 days" in result["explanation"]
    assert "very high failed payment rate" in result["explanation"]


def test_no_major_risk_factors():
    result = explain_customer_risk(0, 0.0, 5000)

    assert result["total_risk_factors"] == 0
    assert result["risk_factors"] == []
    assert "No major payment risk factors identified" in result["explanation"]


def test_invalid_days_overdue():
    try:
        explain_customer_risk(-5, 0.5, 10000)
        assert False
    except ValueError:
        assert True


def test_invalid_payment_rate():
    try:
        explain_customer_risk(10, 1.5, 10000)
        assert False
    except ValueError:
        assert True


def test_invalid_invoice_amount():
    try:
        explain_customer_risk(10, 0.5, 0)
        assert False
    except ValueError:
        assert True