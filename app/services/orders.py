from sqlalchemy.orm import Session

from app.errors import OrderValidationError, OutOfStockError
from app.models import Order, OrderItem, Product
from app.schemas import OrderIn
from app.services.coupons import apply_coupon
from app.services.payments import charge_payment
from app.services.validation import validate_items


def create_order(db: Session, payload: OrderIn) -> Order:
    errors = validate_items(db, payload.items)
    if errors:
        raise OrderValidationError(errors)

    total_cents = 0
    reserved: list[tuple[Product, int, int]] = []
    for item in payload.items:
        product = db.get(Product, item.product_id)
        if product.stock < item.quantity:
            raise OutOfStockError(product.name)
        unit_price_cents = int(product.price * 100)
        total_cents += unit_price_cents * item.quantity
        reserved.append((product, item.quantity, unit_price_cents))

    if payload.coupon_code:
        total_cents = apply_coupon(db, payload.coupon_code, total_cents)

    charge_payment(total_cents)

    for product, quantity, _ in reserved:
        product.stock = product.stock - quantity

    order = Order(total_cents=total_cents, coupon_code=payload.coupon_code)
    db.add(order)
    db.flush()
    for product, quantity, unit_price_cents in reserved:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price_cents=unit_price_cents,
            )
        )
    db.commit()
    db.refresh(order)
    return order
