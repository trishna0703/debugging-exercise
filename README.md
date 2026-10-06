# Shoplite Order Service — Debugging Exercise

You've joined the team that owns **Shoplite**, a small e-commerce order service
(Node.js, `node:http`, SQLite). Overnight, support escalated several
customer complaints. Your job: **investigate and fix as many of the bug tickets
below as you can.**

The test suite encodes the expected behavior — each ticket has failing tests
that reproduce it. A ticket counts as fixed when its tests pass (and you can
explain the root cause).

## Setup (2 minutes)

Requires Node.js 24+. There are **no external dependencies** — nothing to
download.

```bash
node --version       # 24 or newer

# run the test suite — this is your bug reproduction
npm test

# optionally run the server and poke it by hand
npm start
# then e.g.: curl 'http://localhost:8000/products?page=1&page_size=2'
```

`npm run dev` starts the server in watch mode.

## Ground rules

- Fix the **root cause**, not the test.
- Don't modify anything under `tests/` — they define correct behavior.
- Use anything you normally would: debugger, logs, docs, search.
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

Failing tests: `npm run test:products`

### BUG-103 — Checkout crashes with any coupon code (P1)

> Marketing launched the `WELCOME10` coupon this morning. Every checkout that
> includes a *known* coupon code — valid or expired — returns **500 Internal
> Server Error**. Coupons worked in the old PHP system.

Failing tests: `npm run test:coupons`

### BUG-105 — Flash-sale item oversold, stock went negative (P0)

> During the deskmat flash sale we had 3 units in stock but confirmed **5
> orders**, and the inventory dashboard showed negative stock. Only happens
> under load — single requests behave correctly.

Failing test: `npm run test:inventory`

### Stretch tickets (only if time remains)

### BUG-102 — Valid orders rejected after someone submits a bad one (P1)

> Ops noticed a weird pattern: after any customer submits an invalid order
> (e.g. quantity 0), **every subsequent order fails with 400** — even perfectly
> valid ones — and the error message references the *earlier* customer's
> mistake. A server restart makes it go away… until the next invalid order.

Failing test: `npm run test:validation`

### BUG-104 — Order totals off by a few cents (P2)

> Finance can't reconcile yesterday's ledger. Orders containing the
> *Mechanical Keyboard* ($19.99) are charged slightly **less** than the sum of
> their line items — one cent short per unit. Small per order, but it adds up.

Failing tests: `npm run test:totals`

---

## Repo map

```
src/
  index.js           main — starts the HTTP server
  api/               HTTP handlers, routing, error -> status mapping
  errors.js          error types the API maps onto status codes
  store/             SQLite schema, data access and seed data
  services/          checkout, coupons, validation and payment logic
tests/
  *.test.js          one file per ticket — do not modify
support/
  app.js             starts an in-process server for the ticket tests
```

## API surface

| Method | Path        | Notes                                           |
| ------ | ----------- | ----------------------------------------------- |
| GET    | `/health`   | liveness                                        |
| GET    | `/products` | `page` (1-indexed) and `page_size` query params |
| POST   | `/orders`   | JSON order with items and optional coupon code  |

Example order body:

```json
{
  "items": [{ "product_id": 1, "quantity": 2 }],
  "coupon_code": "WELCOME10"
}
```

Order errors map to status codes: validation problems → `400`, coupon problems
→ `400`, insufficient stock → `409`, anything unrecognised → `500`.
