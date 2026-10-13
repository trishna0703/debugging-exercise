import express from "express";

import {
  CouponError,
  OrderValidationError,
  OutOfStockError,
} from "../errors.js";
import { Store } from "../store/store.js";
import { deleteProduct, restock } from "./admin.js";
import { placeOrder } from "./orders.js";
import { listProducts } from "./products.js";
import { searchProducts } from "./search.js";

function requestUrl(request) {
  return new URL(request.originalUrl, "http://localhost");
}

function writeError(error, request, response, next) {
  if (error?.type === "entity.parse.failed") {
    response.status(400).json({ detail: "invalid JSON body" });
    return;
  }
  if (error instanceof OrderValidationError) {
    response.status(400).json({ detail: error.errors });
    return;
  }
  if (error instanceof CouponError) {
    response.status(400).json({ detail: error.message });
    return;
  }
  if (error instanceof OutOfStockError) {
    response.status(409).json({ detail: error.message });
    return;
  }

  console.error("unhandled error:", error);
  response.status(500).json({ detail: "internal server error" });
}

export function createShopliteApp(store = new Store()) {
  const app = express();
  app.use(express.json());

  app.get("/health", (request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/products", (request, response) => {
    response.status(200).json(listProducts(store, requestUrl(request)));
  });

  app.get("/products/search", (request, response) => {
    response.status(200).json(searchProducts(store, requestUrl(request)));
  });

  app.post("/orders", async (request, response) => {
    const order = await placeOrder(store, request.body);
    response.status(201).json(order);
  });

  app.post("/admin/restock", (request, response) => {
    response.status(200).json(restock(store, request.body));
  });

  app.delete("/admin/products/:id", (request, response) => {
    response.status(200).json(deleteProduct(store, request.params.id));
  });

  app.use((request, response) => {
    response.status(404).json({ detail: "not found" });
  });

  app.use(writeError);
  return app;
}
