import { useState } from "react";
import AlphabetTab from "./components/AlphabetTab.jsx";
import CardsTab from "./components/CardsTab.jsx";
import GroupsTab from "./components/GroupsTab.jsx";
import Login from "./components/Login.jsx";
import PureKoreanTab from "./components/PureKoreanTab.jsx";
import PracticeTab from "./components/PracticeTab.jsx";
import SinoTab from "./components/SinoTab.jsx";
import { usePersistentState } from "./hooks.js";
import { LEVELS, levelOf, setOf } from "./lib/hangul.js";
import { SINO_CATEGORIES, SINO_DIRECTIONS } from "./lib/sino.js";
import { StoreProvider, useStore } from "./store.jsx";

const TABS = [
  { id: "practice", label: "Practice" },
  { id: "pure", label: "Pure Korean" },
  { id: "sino", label: "Sino-Korean" },
  { id: "alphabet", label: "Alphabet" },
  { id: "cards", label: "Cards" },
  { id: "groups", label: "Groups" },
];

const STATUS_TEXT = { loading: "Loading…", saved: "Saved", saving: "Saving…", error: "Not saved. Retrying…", locked: "Locked", offline: "Offline" };

// Per-device preferences (kept in localStorage, not in the database).
const normalizePractice = (p) => ({ group: p.group || "all", dir: p.dir === "en-ko" ? "en-ko" : "ko-en", mode: p.mode === "choice" ? "choice" : "type" });
const normalizeNumbers = (p) => ({ dir: p.dir === "num-ko" ? "num-ko" : "ko-num", range: p.range || "0-99", count: p.count || "10" });

const normalizeSino = (p) => ({
  dir: SINO_DIRECTIONS.some((d) => d.id === p.dir) ? p.dir : "ko-num",
  cat: SINO_CATEGORIES.some((c) => c.id === p.cat) ? p.cat : "digits",
  count: ["10", "20", "50"].includes(p.count) ? p.count : "10",
});

const normalizeAlphabet = (p) => {
  const level = levelOf(p.level);
  return { level: level.id, set: setOf(level, p.set).id, count: ["10", "20", "50", "100"].includes(p.count) ? p.count : "10" };
};

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { loaded, status, loadError, retryLoad } = useStore();
  const [tab, setTab] = useState("practice");
  const [practicePrefs, setPracticePrefs] = usePersistentState("hangeul-practice-prefs", { group: "all", dir: "ko-en", mode: "type" }, normalizePractice);
  const [numberPrefs, setNumberPrefs] = usePersistentState("hangeul-numbers-prefs", { dir: "ko-num", range: "0-99", count: "10" }, normalizeNumbers);

  const [sinoPrefs, setSinoPrefs] = usePersistentState("hangeul-sino-prefs", { dir: "ko-num", cat: "digits", count: "10" }, normalizeSino);
  const [alphabetPrefs, setAlphabetPrefs] = usePersistentState("hangeul-alphabet-prefs", { level: LEVELS[0].id, set: LEVELS[0].sets[0].id, count: "10" }, normalizeAlphabet);

  function practiceGroup(group) {
    setPracticePrefs({ group });
    setTab("practice");
  }

  let body;
  if (status === "locked") body = <Login />;
  else if (!loaded && status === "offline")
    body = (
      <section>
        <h2>Can't load your cards</h2>
        <p className="sub">{loadError}</p>
        <button type="button" className="btn primary" onClick={retryLoad}>
          Try again
        </button>
      </section>
    );
  else if (!loaded) body = null;
  else if (tab === "practice") body = <PracticeTab prefs={practicePrefs} setPrefs={setPracticePrefs} />;
  else if (tab === "pure") body = <PureKoreanTab prefs={numberPrefs} setPrefs={setNumberPrefs} />;
  else if (tab === "sino") body = <SinoTab prefs={sinoPrefs} setPrefs={setSinoPrefs} />;
  else if (tab === "alphabet") body = <AlphabetTab prefs={alphabetPrefs} setPrefs={setAlphabetPrefs} />;
  else if (tab === "cards") body = <CardsTab />;
  else body = <GroupsTab onPractice={practiceGroup} />;

  return (
    <div className="wrap">
      <header>
        <div className="brand">
          <span className="ko" lang="ko">
            한글 연습
          </span>
          <span className="name">Hangeul Practice</span>
        </div>
        <div id="status" role="status" aria-live="polite">
          {STATUS_TEXT[status]}
        </div>
      </header>
      {loaded && (
        <nav aria-label="Sections">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-current={tab === t.id ? "page" : "false"} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
      )}
      <main>{body}</main>
    </div>
  );
}
