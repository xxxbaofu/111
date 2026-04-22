from wig_ai_studio.app import app


def test_reviews_endpoint() -> None:
    client = app.test_client()
    response = client.get("/api/reviews?limit=2")
    assert response.status_code == 200
    payload = response.get_json()
    assert isinstance(payload["items"], list)
    assert len(payload["items"]) <= 2


def test_checkout_preview_endpoint() -> None:
    client = app.test_client()
    response = client.post(
        "/api/checkout/preview",
        json={
            "items": [{"productId": "WIG-001", "quantity": 2}],
            "discountCode": "WIG10",
            "shippingMethod": "standard",
        },
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["pricing"]["subtotalCny"] > 0
    assert payload["pricing"]["totalCny"] > 0
    assert payload["couponApplied"] == "WIG10"


def test_checkout_preview_with_unknown_product() -> None:
    client = app.test_client()
    response = client.post(
        "/api/checkout/preview",
        json={
            "items": [{"productId": "WIG-UNKNOWN", "quantity": 1}],
            "discountCode": "WIG10",
            "shippingMethod": "standard",
        },
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["pricing"]["subtotalCny"] == 0
    assert len(payload["skippedItems"]) == 1


def test_newsletter_subscribe_endpoint() -> None:
    client = app.test_client()
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "demo@example.com", "preference": "cosplay"},
    )
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["ok"] is True


def test_newsletter_subscribe_rejects_bad_preference() -> None:
    client = app.test_client()
    response = client.post(
        "/api/newsletter/subscribe",
        json={"email": "demo2@example.com", "preference": "invalid-preference"},
    )
    assert response.status_code == 400
    payload = response.get_json()
    assert payload["ok"] is False
