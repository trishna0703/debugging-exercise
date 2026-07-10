from sqlalchemy.orm import Session

from app.models import Coupon, Product


def _products() -> list[Product]:
    return [
        Product(id=1, name="Wireless Mouse", price=24.50, stock=100),
        Product(id=2, name="Mechanical Keyboard", price=19.99, stock=100),
        Product(id=3, name="USB-C Hub", price=34.00, stock=100),
        Product(id=4, name="Laptop Stand", price=42.75, stock=50),
        Product(id=5, name="4K Webcam", price=59.99, stock=40),
        Product(id=6, name="Limited Edition Deskmat", price=15.00, stock=3),
    ]


def _coupons() -> list[Coupon]:
    return [
        Coupon(code="WELCOME10", percent_off=10, expires_at="2030-01-01T00:00:00+00:00"),
        Coupon(code="EXPIRED20", percent_off=20, expires_at="2024-01-01T00:00:00+00:00"),
    ]


def seed(db: Session) -> None:
    if db.query(Product).count() > 0:
        return
    db.add_all(_products())
    db.add_all(_coupons())
    db.commit()
