class OrderValidationError(Exception):
    def __init__(self, errors: list[str]):
        self.errors = errors
        super().__init__("; ".join(errors))


class CouponError(Exception):
    pass


class OutOfStockError(Exception):
    def __init__(self, product_name: str):
        self.product_name = product_name
        super().__init__(f"{product_name} is out of stock")
