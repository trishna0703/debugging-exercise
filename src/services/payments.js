// The real gateway call takes a little while, so this stub simulates latency.
export async function chargePayment(totalCents) {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return `ch_${totalCents}`;
}
