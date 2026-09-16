export class OrderValidationError extends Error {
  constructor(errors) {
    super(errors.join("; "));
    this.name = "OrderValidationError";
    this.errors = errors;
  }
}

export class CouponError extends Error {
  constructor(message) {
    super(message);
    this.name = "CouponError";
  }
}

export class OutOfStockError extends Error {
  constructor(productName) {
    super(`${productName} is out of stock`);
    this.name = "OutOfStockError";
    this.productName = productName;
  }
}
