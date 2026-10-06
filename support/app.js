import { once } from "node:events";

import { createShopliteApp } from "../src/api/server.js";
import { Store } from "../src/store/store.js";

export async function createTestApp(t) {
  const store = new Store(":memory:");
  const app = createShopliteApp(store);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

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
