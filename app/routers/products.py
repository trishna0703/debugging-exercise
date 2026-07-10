from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductOut

router = APIRouter()


@router.get("/products")
def list_products(page: int = 1, page_size: int = 10, db: Session = Depends(get_db)):
    """List products, ordered by id. `page` is 1-indexed."""
    offset = page * page_size
    products = (
        db.query(Product)
        .order_by(Product.id)
        .offset(offset)
        .limit(page_size)
        .all()
    )
    return {
        "page": page,
        "page_size": page_size,
        "items": [ProductOut.model_validate(p).model_dump() for p in products],
    }
