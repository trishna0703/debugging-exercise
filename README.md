# Shoplite Order Service — Debugging Exercise

You've joined the team that owns **Shoplite**, a small e-commerce order service
(FastAPI + SQLAlchemy + SQLite). Overnight, support escalated several customer
complaints. Your job: **investigate and fix as many of the bug tickets below as
you can.**

The test suite encodes the expected behavior — each ticket has failing tests
that reproduce it. A ticket counts as fixed when its tests pass (and you can
explain the root cause).

## Setup (5 minutes)

Requires Python 3.10+.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# run the test suite — this is your bug reproduction
pytest

# optionally run the server and poke it by hand
uvicorn app.main:app --reload
# then e.g.: curl 'http://localhost:8000/products?page=1&page_size=2'
```

## Ground rules

- Fix the **root cause**, not the test.
- Don't modify anything under `tests/` — they define correct behavior.
- Use anything you normally would: debugger, print statements, docs, search.
- Talk through your reasoning as you go.

---

## Bug tickets

**You are not expected to fix everything in an hour.** Work through the three
**core tickets** first — in whatever order you think is right. The two
**stretch tickets** are bonus if time remains. How you prioritize and how you
investigate matter as much as how many you fix.

### Core tickets

### BUG-101 — First products missing from the catalog (P2)

> Customers report the first products in the catalog never appear on page 1 of
> the storefront, and the last page of results comes back empty. The mobile
> team confirms they call `GET /products?page=1&page_size=...` and pages are
> 1-indexed.

Failing tests: `tests/test_01_products.py`

### BUG-103 — Checkout crashes with any coupon code (P1)

> Marketing launched the `WELCOME10` coupon this morning. Every checkout that
> includes a coupon code — valid or expired — returns **500 Internal Server
> Error**. Coupons worked in the old PHP system.

Failing tests: `tests/test_03_coupons.py`

### BUG-105 — Flash-sale item oversold, stock went negative (P0)

> During the deskmat flash sale we had 3 units in stock but confirmed **5
> orders**, and the inventory dashboard showed negative stock. Only happens
> under load — single requests behave correctly.

Failing test: `tests/test_04_inventory.py::test_concurrent_orders_do_not_oversell`

### Stretch tickets (only if time remains)

### BUG-102 — Valid orders rejected after someone submits a bad one (P1)

> Ops noticed a weird pattern: after any customer submits an invalid order
> (e.g. quantity 0), **every subsequent order fails with 400** — even
> perfectly valid ones — and the error message references the *earlier*
> customer's mistake. A server restart makes it go away… until the next
> invalid order.

Failing test: `tests/test_05_validation.py::test_valid_order_succeeds_after_an_invalid_one`

### BUG-104 — Order totals off by a few cents (P2)

> Finance can't reconcile yesterday's ledger. Orders containing the
> *Mechanical Keyboard* ($19.99) are charged slightly **less** than the sum of
> their line items — one cent short per unit. Small per order, but it adds up.

Failing tests: `tests/test_02_order_totals.py`

---

## Repo map

```
app/
  main.py            FastAPI app, error handlers, startup seeding
  database.py        engine / session setup
  models.py          SQLAlchemy models
  schemas.py         request/response models
  seed.py            seed data (products, coupons)
  routers/           HTTP endpoints (products, orders)
  services/          business logic (orders, coupons, validation, payments)
tests/               one file per ticket — do not modify
```
