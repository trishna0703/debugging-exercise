from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.database import Base, SessionLocal, engine
from app.errors import CouponError, OrderValidationError, OutOfStockError
from app.routers import orders, products
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed(db)
    yield


app = FastAPI(title="Shoplite Order Service", lifespan=lifespan)
app.include_router(products.router)
app.include_router(orders.router)


@app.exception_handler(OrderValidationError)
async def validation_error_handler(request: Request, exc: OrderValidationError):
    return JSONResponse(status_code=400, content={"detail": exc.errors})


@app.exception_handler(CouponError)
async def coupon_error_handler(request: Request, exc: CouponError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(OutOfStockError)
async def out_of_stock_handler(request: Request, exc: OutOfStockError):
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.get("/health")
def health():
    return {"status": "ok"}
