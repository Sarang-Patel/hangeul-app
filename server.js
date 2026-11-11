// Normal Node server: serves the built React app (dist/) and the API (/api).
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = require("./app");

if (!process.env.APP_PASSWORD) {
  console.warn("WARNING: APP_PASSWORD is not set. Anyone with the URL can read and change your cards.");
}
if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not set. The API will return errors until you set it.");
}

const dist = path.join(__dirname, "dist");
if (!fs.existsSync(path.join(dist, "index.html"))) {
  console.warn("WARNING: dist/ not found. Run `npm run build` first (the page will not load without it).");
}
app.use(express.static(dist));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hangeul Practice running at http://localhost:${port}`));
