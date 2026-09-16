import { createOrder } from "../services/orders.js";

export async function placeOrder(store, body) {
  return createOrder(store, body);
}
