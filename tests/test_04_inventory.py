"""BUG-105: limited-stock items must never oversell."""

from concurrent.futures import ThreadPoolExecutor

from app.models import Product

DESKMAT_ID = 6  # seeded with stock = 3


def _order_one(client):
    resp = client.post(
        "/orders", json={"items": [{"product_id": DESKMAT_ID, "quantity": 1}]}
    )
    return resp.status_code


def test_single_order_cannot_exceed_stock(client):
    resp = client.post(
        "/orders", json={"items": [{"product_id": DESKMAT_ID, "quantity": 5}]}
    )
    assert resp.status_code == 409


def test_concurrent_orders_do_not_oversell(client, session_factory):
    with ThreadPoolExecutor(max_workers=5) as pool:
        statuses = list(pool.map(lambda _: _order_one(client), range(5)))

    successes = statuses.count(201)
    with session_factory() as db:
        stock = db.get(Product, DESKMAT_ID).stock

    assert successes == 3, f"sold {successes} units but only 3 were in stock"
    assert stock == 0, f"stock ended at {stock}, expected 0"
