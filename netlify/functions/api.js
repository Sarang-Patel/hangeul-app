// Netlify Function wrapper around the same Express app.
const serverless = require("serverless-http");
const app = require("../../app");

module.exports.handler = serverless(app);
