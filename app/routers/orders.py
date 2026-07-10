from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OrderIn, OrderOut
from app.services.orders import create_order

router = APIRouter()


@router.post("/orders", response_model=OrderOut, status_code=201)
def place_order(payload: OrderIn, db: Session = Depends(get_db)):
    order = create_order(db, payload)
    return order
