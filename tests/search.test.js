import assert from "node:assert/strict";
import test from "node:test";

import { createTestApp } from "../support/app.js";

test("search returns results", async (t) => {
  const app = await createTestApp(t);
  const response = await app.get("/products/search?q=Mouse");
  const body = await response.json();

  assert.equal(response.status, 200, JSON.stringify(body));
  assert.ok(body.count >= 1, `count = ${body.count}, want at least 1`);
});
