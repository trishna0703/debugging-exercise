import { createShopliteServer } from "../src/api/server.js";
import { Store } from "../src/store/store.js";

export async function createTestApp(t) {
  const store = new Store(":memory:");
  const server = createShopliteServer(store);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    store.close();
  });

  const address = server.address();
  const url = `http://127.0.0.1:${address.port}`;

  return {
    store,
    get(path) {
      return fetch(url + path);
    },
    postJson(path, body) {
      return fetch(url + path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    },
  };
}
