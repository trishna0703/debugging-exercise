// BUG-103: checkout with a coupon code.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

function order(app, couponCode) {
  return app.postJson("/orders", {
    items: [{ product_id: 3, quantity: 2 }],
    coupon_code: couponCode,
  });
}

test("valid coupon applies discount", async (t) => {
  const app = await createTestApp(t);
  const response = await order(app, "WELCOME10");
  const body = await response.json();

  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.total_cents, 6800 - 680);
});

test("expired coupon is rejected with 400", async (t) => {
  const app = await createTestApp(t);
  const response = await order(app, "EXPIRED20");
  const body = await response.json();

  assert.equal(response.status, 400, JSON.stringify(body));
  assert.match(body.detail, /expired/u);
});

test("unknown coupon is rejected with 400", async (t) => {
  const app = await createTestApp(t);
  const response = await order(app, "NOPE");
  const body = await response.json();

  assert.equal(response.status, 400, JSON.stringify(body));
  assert.match(body.detail, /unknown/u);
});
