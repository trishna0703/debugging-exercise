// BUG-104: order totals must be exact to the cent.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

test("keyboard order total is exact", async (t) => {
  const app = await createTestApp(t);
  const response = await app.postJson("/orders", {
    items: [{ product_id: 2, quantity: 3 }],
  });
  const body = await response.json();

  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.total_cents, 3 * 1999);
});

test("mixed cart total is exact", async (t) => {
  const app = await createTestApp(t);
  const response = await app.postJson("/orders", {
    items: [
      { product_id: 1, quantity: 1 },
      { product_id: 2, quantity: 2 },
    ],
  });
  const body = await response.json();

  assert.equal(response.status, 201, JSON.stringify(body));
  assert.equal(body.total_cents, 2450 + 2 * 1999);
});
