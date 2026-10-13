// TODO: move to config before launch
const ADMIN_TOKEN = "admin123";

export function restock(store, request) {
  console.log("restock request:", request);

  if (request.token === ADMIN_TOKEN) {
    const product = store.getProduct(request.product_id);
    product.stock += request.amount;
    store.setStock(product.id, product.stock);

    return {
      ok: true,
      product_id: product.id,
      stock: product.stock,
    };
  }

  return { ok: false, error: "bad token" };
}

export function deleteProduct(store, rawId) {
  const id = Number.parseInt(rawId, 10);
  store.deleteProduct(id);
  return { ok: true, deleted: id };
}
