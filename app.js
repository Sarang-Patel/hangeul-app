// Express app shared by the normal Node server (server.js) and the Netlify Function.
const express = require("express");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

const DB_NAME = process.env.MONGODB_DB || "hangeul";
const PASSWORD = process.env.APP_PASSWORD || "";
const SECRET = process.env.TOKEN_SECRET || PASSWORD;

/* ---------- MongoDB (one cached connection, reused across serverless calls) ---------- */
let clientPromise = null;
function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(httpError(500, "MONGODB_URI is not set on the server."));
  if (!clientPromise) {
    clientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
      .connect()
      .catch((e) => {
        clientPromise = null;
        throw e;
      });
  }
  return clientPromise.then((c) => c.db(DB_NAME));
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

/* ---------- Password protection (optional but recommended) ---------- */
const sha = (s) => crypto.createHash("sha256").update(String(s)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b));
const sessionToken = () =>
  crypto.createHmac("sha256", SECRET).update("hangeul-practice-session").digest("hex");

const attempts = new Map(); // ip -> { n, reset }
function loginLimited(ip) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) {
    attempts.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  a.n += 1;
  return a.n > 10;
}

function requireAuth(req, res, next) {
  if (!PASSWORD) return next();
  const m = /^Bearer (.+)$/.exec(req.get("authorization") || "");
  if (m && safeEqual(m[1], sessionToken())) return next();
  res.status(401).json({ error: "Password required." });
}

/* ---------- Validation ---------- */
const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const MAX_CARDS = 5000;
const MAX_GROUPS = 200;

function text(v, max, label) {
  if (typeof v !== "string") throw httpError(400, `${label} must be text.`);
  const t = v.trim();
  if (!t || t.length > max) throw httpError(400, `${label} must be 1-${max} characters.`);
  return t;
}

function cleanState(body) {
  if (!body || !Array.isArray(body.cards) || !Array.isArray(body.groups))
    throw httpError(400, "Expected { groups: [], cards: [] }.");
  if (body.cards.length > MAX_CARDS) throw httpError(400, `At most ${MAX_CARDS} cards.`);
  if (body.groups.length > MAX_GROUPS) throw httpError(400, `At most ${MAX_GROUPS} groups.`);

  const seen = new Set();
  const groups = body.groups.map((g) => {
    if (!g || !ID_RE.test(g.id) || seen.has(g.id)) throw httpError(400, "Bad group id.");
    seen.add(g.id);
    return { id: g.id, name: text(g.name, 80, "Group name") };
  });

  const seenCards = new Set();
  const cards = body.cards.map((c) => {
    if (!c || !ID_RE.test(c.id) || seenCards.has(c.id)) throw httpError(400, "Bad card id.");
    seenCards.add(c.id);
    const g = c.g == null || c.g === "" ? "" : String(c.g);
    if (g && !seen.has(g)) throw httpError(400, "Card points to a group that does not exist.");
    return { id: c.id, ko: text(c.ko, 200, "Korean"), en: text(c.en, 200, "English"), g };
  });

  return { groups, cards, starter: !!body.starter };
}

/* ---------- Routes ---------- */
const api = express.Router();

api.get("/health", (req, res) => res.json({ ok: true, passwordProtected: !!PASSWORD }));

api.post("/login", (req, res) => {
  if (!PASSWORD) return res.json({ token: "" });
  if (loginLimited(req.ip)) return res.status(429).json({ error: "Too many attempts. Wait a minute." });
  const pw = req.body && typeof req.body.password === "string" ? req.body.password : "";
  if (!safeEqual(pw, PASSWORD)) return res.status(401).json({ error: "Wrong password." });
  res.json({ token: sessionToken() });
});

api.get("/state", requireAuth, async (req, res, next) => {
  try {
    const db = await getDb();
    const [cards, groups, meta] = await Promise.all([
      db.collection("cards").find().sort({ pos: 1 }).toArray(),
      db.collection("groups").find().sort({ pos: 1 }).toArray(),
      db.collection("meta").findOne({ _id: "settings" }),
    ]);
    res.json({
      seeded: !!(meta && meta.seeded),
      starter: !!(meta && meta.starter),
      groups: groups.map((g) => ({ id: g._id, name: g.name })),
      cards: cards.map((c) => ({ id: c._id, ko: c.ko, en: c.en, g: c.g || "" })),
    });
  } catch (e) {
    next(e);
  }
});

// Replaces the stored cards and groups with the posted ones (per-document upserts + deletes).
api.put("/state", requireAuth, async (req, res, next) => {
  try {
    const { groups, cards, starter } = cleanState(req.body);
    const db = await getDb();

    const groupOps = groups.map((g, i) => ({
      updateOne: { filter: { _id: g.id }, update: { $set: { name: g.name, pos: i } }, upsert: true },
    }));
    const cardOps = cards.map((c, i) => ({
      updateOne: {
        filter: { _id: c.id },
        update: { $set: { ko: c.ko, en: c.en, g: c.g, pos: i } },
        upsert: true,
      },
    }));

    if (groupOps.length) await db.collection("groups").bulkWrite(groupOps, { ordered: false });
    if (cardOps.length) await db.collection("cards").bulkWrite(cardOps, { ordered: false });
    await Promise.all([
      db.collection("groups").deleteMany({ _id: { $nin: groups.map((g) => g.id) } }),
      db.collection("cards").deleteMany({ _id: { $nin: cards.map((c) => c.id) } }),
      db.collection("meta").updateOne(
        { _id: "settings" },
        { $set: { seeded: true, starter } },
        { upsert: true }
      ),
    ]);
    res.json({ ok: true, cards: cards.length, groups: groups.length });
  } catch (e) {
    next(e);
  }
});

api.use((req, res) => res.status(404).json({ error: "Not found." }));

const app = express();
app.set("trust proxy", true);
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
// "/api" for the Node server; the Netlify path is mounted too so both hosts work.
app.use("/api", api);
app.use("/.netlify/functions/api", api);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({
    error: err.status === 500 && err.message.includes("MONGODB_URI") ? err.message : "Database error. Check the server logs.",
  });
});

module.exports = app;
