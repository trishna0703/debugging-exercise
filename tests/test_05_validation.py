"""BUG-102: order validation must not leak state between requests."""


def test_invalid_quantity_rejected(client):
    resp = client.post(
        "/orders", json={"items": [{"product_id": 1, "quantity": 0}]}
    )
    assert resp.status_code == 400


def test_unknown_product_rejected(client):
    resp = client.post(
        "/orders", json={"items": [{"product_id": 999, "quantity": 1}]}
    )
    assert resp.status_code == 400


def test_valid_order_succeeds_after_an_invalid_one(client):
    bad = client.post(
        "/orders", json={"items": [{"product_id": 1, "quantity": -2}]}
    )
    assert bad.status_code == 400

    good = client.post(
        "/orders", json={"items": [{"product_id": 1, "quantity": 1}]}
    )
    assert good.status_code == 201, (
        f"valid order was rejected: {good.json()}"
    )
