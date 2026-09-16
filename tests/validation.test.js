// BUG-102: order validation must not leak state between requests.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

test("invalid quantity is rejected", async (t) => {
  const app = await createTestApp(t);
  const response = await app.postJson("/orders", {
    items: [{ product_id: 1, quantity: 0 }],
  });

  assert.equal(response.status, 400);
});

test("unknown product is rejected", async (t) => {
  const app = await createTestApp(t);
  const response = await app.postJson("/orders", {
    items: [{ product_id: 999, quantity: 1 }],
  });

  assert.equal(response.status, 400);
});

test("valid order succeeds after an invalid one", async (t) => {
  const app = await createTestApp(t);
  const bad = await app.postJson("/orders", {
    items: [{ product_id: 1, quantity: -2 }],
  });
  assert.equal(bad.status, 400);

  const good = await app.postJson("/orders", {
    items: [{ product_id: 1, quantity: 1 }],
  });
  const body = await good.json();

  assert.equal(
    good.status,
    201,
    `valid order was rejected: ${JSON.stringify(body)}`,
  );
});
