# Hangeul Practice

Korean flashcards with groups and shuffled practice (Korean → English or English → Korean).
Node + Express API, MongoDB storage, plain HTML/JS front end.

```
public/index.html          the app (no build step)
app.js                     Express API (/api/state, /api/login, /api/health)
server.js                  starts the API and serves public/ (Render, Railway, Fly, VPS)
netlify/functions/api.js   same API as a Netlify Function
netlify.toml               Netlify settings
```

## 1. Create the database (MongoDB Atlas, free)

1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** → add a user with a password (read and write to any database).
3. **Network Access** → add `0.0.0.0/0`. Hosts like Render and Netlify use changing IPs, so Atlas can't allow a fixed one. The database user's password is what protects it.
4. **Connect → Drivers** → copy the connection string and put your password in it. This is your `MONGODB_URI`.

Collections (`cards`, `groups`, `meta`) are created automatically in the `hangeul` database.

## 2. Environment variables

| Name | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string |
| `APP_PASSWORD` | recommended | Password screen for the whole app. If unset, anyone with the URL can edit your cards. |
| `MONGODB_DB` | no | Database name (default `hangeul`) |
| `TOKEN_SECRET` | no | Separate secret for signing login tokens (defaults to `APP_PASSWORD`) |

## 3a. Run locally

```bash
npm install
cp .env.example .env      # fill in the values
export $(grep -v '^#' .env | xargs)
npm start                 # http://localhost:3000
```

## 3b. Deploy on Netlify

1. Push this folder to a GitHub repo.
2. Netlify → **Add new site → Import from Git**. It reads `netlify.toml`, so leave the build command empty.
3. **Site settings → Environment variables** → add `MONGODB_URI` and `APP_PASSWORD`.
4. Deploy. The page is served from `public/` and `/api/*` goes to the function.

## 3c. Deploy on Render (or Railway, Fly, any Node host)

1. Push to GitHub, then Render → **New → Web Service**.
2. Build command: `npm install`. Start command: `npm start`.
3. Add `MONGODB_URI` and `APP_PASSWORD` as environment variables.

On Render's free plan the service sleeps when idle, so the first load after a pause takes about 30 seconds.

## Notes

- The browser sends the full card list to the server, which saves it with per-card upserts and deletes. Saving happens about half a second after each change.
- If you use the app on two devices at once, the last save wins. Reload before editing on the other device.
- Limits: 5,000 cards, 200 groups, 200 characters per side of a card.
- Login attempts are limited to 10 per minute per IP (per server instance on Netlify).
