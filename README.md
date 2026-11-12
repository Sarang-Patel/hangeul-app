# Hangeul Practice

Korean flashcards with groups, typed and multiple-choice practice, file import, pure Korean numbers (0–99),
and alphabet practice (letters, syllables, words).
React (Vite) front end, Node + Express API, MongoDB storage.

```
index.html                  Vite entry page
vite.config.mjs             Vite config (dev proxy: /api -> :3000)
src/
  main.jsx, App.jsx         app shell and tabs
  store.jsx                 cards/groups state, loading and debounced saving
  api.js                    calls to /api
  hooks.js                  per-device preferences (localStorage)
  components/               PracticeTab, NumbersTab, AlphabetTab, CardsTab, ImportPanel, GroupsTab,
                            Session, Results, RunFlow, Login, Common
  lib/                      numbers.js (native numbers), hangul.js (letters, syllables, words),
                            questions.js (builds questions),
                            answers.js, importer.js, selectors.js, starter.js, util.js
  styles.css
app.js                      Express API (/api/state, /api/login, /api/health)
server.js                   serves dist/ and the API (Render, Railway, Fly, VPS)
netlify/functions/api.js    same API as a Netlify Function
netlify.toml                Netlify build settings
```

## Adding a new kind of practice

Every practice type is a list of questions (shape documented at the top of `src/lib/questions.js`).
Write a builder that returns that list, then render `<RunFlow build={...} renderSetup={...} />`
as `NumbersTab.jsx` does. Session, results, retry-missed and keyboard handling come for free.

## 1. Database (MongoDB Atlas, free)

1. Create a free **M0** cluster at mongodb.com/atlas.
2. **Database Access** → add a user with a password.
3. **Network Access** → add `0.0.0.0/0` (hosts like Netlify and Render use changing IPs).
4. **Connect → Drivers** → copy the connection string and put your password in it. This is `MONGODB_URI`.

## 2. Environment variables

| Name | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | Atlas connection string |
| `APP_PASSWORD` | recommended | Password screen for the whole app |
| `MONGODB_DB` | no | Database name (default `hangeul`) |
| `TOKEN_SECRET` | no | Separate secret for login tokens |

## 3a. Run locally

```bash
npm install
cp .env.example .env            # fill in the values
export $(grep -v '^#' .env | xargs)

# development: two terminals
npm run dev:server              # API on http://localhost:3000
npm run dev                     # React app with hot reload on http://localhost:5173

# or production style: one process
npm run build
npm start                       # http://localhost:3000
```

## 3b. Netlify

Import the repo. `netlify.toml` sets everything:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Add `MONGODB_URI` and `APP_PASSWORD` under Site settings → Environment variables.

## 3c. Render (or Railway, Fly, any Node host)

- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`
- Environment variables: `MONGODB_URI`, `APP_PASSWORD`

The build needs the dev dependencies (Vite), which is why `--include=dev` is there.

## Notes

- Saving happens about half a second after each change. The browser sends the full card list and the server upserts and deletes per card.
- If you use the app on two devices at once, the last save wins.
- Limits: 5,000 cards, 200 groups, 200 characters per side of a card.
- Pure Korean has no word for zero. The app uses 영 (and accepts 공) and says so on that question.
