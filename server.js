// Normal Node server: serves the page from /public and the API from /api.
const path = require("path");
const express = require("express");
const app = require("./app");

if (!process.env.APP_PASSWORD) {
  console.warn("WARNING: APP_PASSWORD is not set. Anyone with the URL can read and change your cards.");
}
if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is not set. The API will return errors until you set it.");
}

app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Hangeul Practice running at http://localhost:${port}`));
