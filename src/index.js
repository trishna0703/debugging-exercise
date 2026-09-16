import { createShopliteServer } from "./api/server.js";

const port = Number(process.env.PORT ?? 8000);
const server = createShopliteServer();

server.listen(port, () => {
  console.log(`Shoplite listening on http://localhost:${port}`);
});
