import { createShopliteApp } from "./api/server.js";

const port = Number(process.env.PORT ?? 8000);
const app = createShopliteApp();

app.listen(port, () => {
  console.log(`Shoplite listening on http://localhost:${port}`);
});
