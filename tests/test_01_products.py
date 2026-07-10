"""BUG-101: product catalog pagination."""


def _ids(resp):
    return [item["id"] for item in resp.json()["items"]]


def test_first_page_returns_first_products(client):
    resp = client.get("/products", params={"page": 1, "page_size": 2})
    assert resp.status_code == 200
    assert _ids(resp) == [1, 2]


def test_last_page_returns_final_products(client):
    resp = client.get("/products", params={"page": 3, "page_size": 2})
    assert _ids(resp) == [5, 6]


def test_page_past_the_end_is_empty(client):
    resp = client.get("/products", params={"page": 4, "page_size": 2})
    assert _ids(resp) == []
