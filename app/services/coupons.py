from datetime import datetime

from sqlalchemy.orm import Session

from app.errors import CouponError
from app.models import Coupon


def apply_coupon(db: Session, code: str, total_cents: int) -> int:
    """Return the discounted total after applying the coupon."""
    coupon = db.get(Coupon, code)
    if coupon is None:
        raise CouponError(f"unknown coupon code: {code}")

    expires_at = datetime.fromisoformat(coupon.expires_at)
    if expires_at < datetime.now():
        raise CouponError(f"coupon has expired: {code}")

    discount = total_cents * coupon.percent_off // 100
    return total_cents - discount
