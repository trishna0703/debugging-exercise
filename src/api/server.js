import { createServer } from "node:http";

import {
  CouponError,
  OrderValidationError,
  OutOfStockError,
} from "../errors.js";
import { Store } from "../store/store.js";
import { placeOrder } from "./orders.js";
import { listProducts } from "./products.js";

function writeJson(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

function writeError(response, error) {
  if (error instanceof OrderValidationError) {
    writeJson(response, 400, { detail: error.errors });
    return;
  }
  if (error instanceof CouponError) {
    writeJson(response, 400, { detail: error.message });
    return;
  }
  if (error instanceof OutOfStockError) {
    writeJson(response, 409, { detail: error.message });
    return;
  }

  console.error("unhandled error:", error);
  writeJson(response, 500, { detail: "internal server error" });
}

async function readJson(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
  }
  return JSON.parse(raw);
}

async function handleRequest(store, request, response) {
  const url = new URL(request.url, "http://localhost");

  if (request.method === "GET" && url.pathname === "/health") {
    writeJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/products") {
    writeJson(response, 200, listProducts(store, url));
    return;
  }

  if (request.method === "POST" && url.pathname === "/orders") {
    let body;
    try {
      body = await readJson(request);
    } catch {
      writeJson(response, 400, { detail: "invalid JSON body" });
      return;
    }

    const order = await placeOrder(store, body);
    writeJson(response, 201, order);
    return;
  }

  writeJson(response, 404, { detail: "not found" });
}

export function createShopliteServer(store = new Store()) {
  return createServer((request, response) => {
    handleRequest(store, request, response).catch((error) => {
      writeError(response, error);
    });
  });
}
