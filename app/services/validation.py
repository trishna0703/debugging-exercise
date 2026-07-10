from sqlalchemy.orm import Session

from app.models import Product
from app.schemas import OrderItemIn


def validate_items(db: Session, items: list[OrderItemIn], errors=[]):
    """Collect all validation problems for the requested line items."""
    if not items:
        errors.append("order must contain at least one item")
    for item in items:
        if item.quantity <= 0:
            errors.append(
                f"quantity must be positive for product {item.product_id}"
            )
        elif db.get(Product, item.product_id) is None:
            errors.append(f"product {item.product_id} does not exist")
    return errors
