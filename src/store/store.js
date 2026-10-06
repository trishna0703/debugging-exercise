import { DatabaseSync } from "node:sqlite";

import { coupons, products } from "./seed.js";

const schema = `
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    percent_off INTEGER NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    total_cents INTEGER NOT NULL,
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed'
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price_cents INTEGER NOT NULL
  );
`;

// Store is the SQLite data layer for the catalog, coupons and placed orders.
export class Store {
  #database;

  constructor(path = process.env.DATABASE_PATH ?? "./shoplite.db") {
    this.#database = new DatabaseSync(path);
    this.#database.exec(schema);
    this.#seed();
  }

  #seed() {
    const { count } = this.#database
      .prepare("SELECT COUNT(*) AS count FROM products")
      .get();
    if (count > 0) {
      return;
    }

    const insertProduct = this.#database.prepare(`
      INSERT INTO products (id, name, price, stock)
      VALUES (?, ?, ?, ?)
    `);
    const insertCoupon = this.#database.prepare(`
      INSERT INTO coupons (code, percent_off, expires_at)
      VALUES (?, ?, ?)
    `);

    this.#database.exec("BEGIN");
    try {
      for (const product of products()) {
        insertProduct.run(
          product.id,
          product.name,
          product.price,
          product.stock,
        );
      }
      for (const coupon of coupons()) {
        insertCoupon.run(
          coupon.code,
          coupon.percentOff,
          coupon.expiresAt,
        );
      }
      this.#database.exec("COMMIT");
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  listProducts() {
    return this.#database
      .prepare("SELECT id, name, price, stock FROM products ORDER BY id")
      .all();
  }

  getProduct(id) {
    return this.#database
      .prepare("SELECT id, name, price, stock FROM products WHERE id = ?")
      .get(id);
  }

  stock(id) {
    return this.#database
      .prepare("SELECT stock FROM products WHERE id = ?")
      .get(id)?.stock ?? 0;
  }

  getCoupon(code) {
    return this.#database
      .prepare(`
        SELECT
          code,
          percent_off AS percentOff,
          expires_at AS expiresAt
        FROM coupons
        WHERE code = ?
      `)
      .get(code);
  }

  saveOrder(order) {
    const decrementStock = this.#database.prepare(`
      UPDATE products
      SET stock = stock - ?
      WHERE id = ?
    `);
    const insertOrder = this.#database.prepare(`
      INSERT INTO orders (total_cents, coupon_code, status)
      VALUES (?, ?, ?)
    `);
    const insertItem = this.#database.prepare(`
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        unit_price_cents
      ) VALUES (?, ?, ?, ?)
    `);

    this.#database.exec("BEGIN");
    try {
      for (const item of order.items) {
        decrementStock.run(item.quantity, item.product_id);
      }

      const result = insertOrder.run(
        order.total_cents,
        order.coupon_code,
        order.status,
      );
      const id = Number(result.lastInsertRowid);

      for (const item of order.items) {
        insertItem.run(
          id,
          item.product_id,
          item.quantity,
          item.unit_price_cents,
        );
      }

      this.#database.exec("COMMIT");
      return { ...order, id };
    } catch (error) {
      this.#database.exec("ROLLBACK");
      throw error;
    }
  }

  close() {
    this.#database.close();
  }

  query(sql) {
    return this.#database.prepare(sql).all();
  }

  setStock(id, stock) {
    this.#database
      .prepare("UPDATE products SET stock = ? WHERE id = ?")
      .run(stock, id);
  }

  deleteProduct(id) {
    this.#database.prepare("DELETE FROM products WHERE id = ?").run(id);
  }
}
