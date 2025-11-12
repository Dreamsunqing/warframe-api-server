// Minimal Express server exposing only /de/plain/cycles
const express = require("express");
const deRoutes = require("./src/routes/de.js");

const app = express();
app.use(express.json());

// Mount DE routes under /de
app.use("/de", deRoutes);

// Root hint
app.get("/", (req, res) => {
  res.json({ ok: true, routes: ["/de/plain/cycles"] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});