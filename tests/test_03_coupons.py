"""BUG-103: checkout with a coupon code."""


def _order(client, coupon):
    return client.post(
        "/orders",
        json={
            "items": [{"product_id": 3, "quantity": 2}],  # $34.00 each
            "coupon_code": coupon,
        },
    )


def test_valid_coupon_applies_discount(client):
    resp = _order(client, "WELCOME10")
    assert resp.status_code == 201, resp.text
    assert resp.json()["total_cents"] == 6800 - 680


def test_expired_coupon_rejected_with_400(client):
    resp = _order(client, "EXPIRED20")
    assert resp.status_code == 400, resp.text
    assert "expired" in resp.json()["detail"]


def test_unknown_coupon_rejected_with_400(client):
    resp = _order(client, "NOPE")
    assert resp.status_code == 400, resp.text
    assert "unknown" in resp.json()["detail"]
