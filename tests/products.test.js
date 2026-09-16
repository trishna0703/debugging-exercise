// BUG-101: product catalog pagination.
import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

async function ids(response) {
  const body = await response.json();
  return body.items.map((item) => item.id);
}

test("first page returns first products", async (t) => {
  const app = await createTestApp(t);
  const response = await app.get("/products?page=1&page_size=2");

  assert.equal(response.status, 200);
  assert.deepEqual(await ids(response), [1, 2]);
});

test("last page returns final products", async (t) => {
  const app = await createTestApp(t);
  const response = await app.get("/products?page=3&page_size=2");

  assert.deepEqual(await ids(response), [5, 6]);
});

test("page past the end is empty", async (t) => {
  const app = await createTestApp(t);
  const response = await app.get("/products?page=4&page_size=2");

  assert.deepEqual(await ids(response), []);
});
