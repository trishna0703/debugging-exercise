import time


def charge_payment(total_cents: int) -> str:
    """Charge the customer via the payment gateway.

    Stubbed out for this exercise: real gateway calls take a little while,
    so we simulate the latency.
    """
    time.sleep(0.05)
    return "ch_" + str(total_cents)
