import { coupons, products } from "./seed.js";

// Store holds the catalog, coupons and confirmed orders for the lifetime of
// the process. Each test server gets a freshly seeded instance.
export class Store {
  #products = new Map();
  #coupons = new Map();
  #orders = [];
  #nextOrderId = 1;

  constructor() {
    for (const product of products()) {
      this.#products.set(product.id, product);
    }
    for (const coupon of coupons()) {
      this.#coupons.set(coupon.code, coupon);
    }
  }

  listProducts() {
    return [...this.#products.values()]
      .sort((left, right) => left.id - right.id)
      .map((product) => ({ ...product }));
  }

  getProduct(id) {
    return this.#products.get(id);
  }

  stock(id) {
    return this.#products.get(id)?.stock ?? 0;
  }

  getCoupon(code) {
    return this.#coupons.get(code);
  }

  saveOrder(order) {
    order.id = this.#nextOrderId;
    this.#nextOrderId += 1;
    this.#orders.push(order);
    return order;
  }
}
