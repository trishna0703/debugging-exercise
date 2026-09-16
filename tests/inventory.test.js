// BUG-105: limited-stock items must never oversell.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

const DESKMAT_ID = 6;

function orderDeskmat(app, quantity) {
  return app.postJson("/orders", {
    items: [{ product_id: DESKMAT_ID, quantity }],
  });
}

test("single order cannot exceed stock", async (t) => {
  const app = await createTestApp(t);
  const response = await orderDeskmat(app, 5);

  assert.equal(response.status, 409);
});

test("concurrent orders do not oversell", async (t) => {
  const app = await createTestApp(t);
  const attempts = Array.from({ length: 5 }, () => orderDeskmat(app, 1));
  const responses = await Promise.all(attempts);
  const successes = responses.filter((response) => response.status === 201);

  assert.equal(
    successes.length,
    3,
    `sold ${successes.length} units but only 3 were in stock`,
  );
  assert.equal(app.store.stock(DESKMAT_ID), 0);
});
