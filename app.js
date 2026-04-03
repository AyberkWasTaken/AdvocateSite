import "dotenv/config";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

import pageRoutes from "./routes/pageRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { adminBasicAuth } from "./middleware/basicAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", pageRoutes);
app.use("/admin", adminBasicAuth(), adminRoutes);

app.use((req, res) => {
  res.status(404).render("pages/404", {
    title: "Sayfa Bulunamadi",
    currentPath: req.path
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
