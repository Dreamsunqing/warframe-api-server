// Minimal Express server exposing only /de/plain/cycles
const express = require("express");
const deRoutes = require("./src/routes/de.js");
const { success } = require("./src/utils/apiResponse.js");

const app = express();
app.use(express.json());

// Mount DE routes under /de
app.use("/de", deRoutes);

// Root hint
app.get("/", (req, res) => {
  res.json(
    success({
      routes: [
        "/de/plain/cycles",
        "/de/alerts",
        "/de/archsortie",
        "/de/invasions",
        "/de/shipprogress",
      ],
    })
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
