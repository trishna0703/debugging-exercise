"""BUG-104: order totals must be exact to the cent."""


def test_keyboard_order_total_is_exact(client):
    # Mechanical Keyboard is $19.99 -> 1999 cents each.
    resp = client.post(
        "/orders", json={"items": [{"product_id": 2, "quantity": 3}]}
    )
    assert resp.status_code == 201, resp.json()
    assert resp.json()["total_cents"] == 3 * 1999


def test_mixed_cart_total_is_exact(client):
    resp = client.post(
        "/orders",
        json={
            "items": [
                {"product_id": 1, "quantity": 1},  # $24.50
                {"product_id": 2, "quantity": 2},  # $19.99 each
            ]
        },
    )
    assert resp.status_code == 201, resp.json()
    assert resp.json()["total_cents"] == 2450 + 2 * 1999
