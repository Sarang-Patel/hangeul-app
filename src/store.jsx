// App data (cards and groups): loading from the API, local edits, and debounced saving.
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import * as api from "./api.js";
import { makeStarter } from "./lib/starter.js";
import { uid } from "./lib/util.js";

const initial = { loaded: false, groups: [], cards: [], starter: false, rev: 0 };

// Every edit bumps `rev`; the saver watches it. "loaded" does not, so loading never triggers a save.
function reducer(s, a) {
  const edit = (patch) => ({ ...s, ...patch, rev: s.rev + 1 });
  switch (a.type) {
    case "loaded":
      return { ...s, loaded: true, groups: a.groups, cards: a.cards, starter: a.starter };
    case "seed":
      return edit({ loaded: true, ...a.data });
    case "addCard":
      return edit({ cards: [a.card, ...s.cards] });
    case "updateCard":
      return edit({ cards: s.cards.map((c) => (c.id === a.id ? { ...c, ...a.patch } : c)) });
    case "deleteCard":
      return edit({ cards: s.cards.filter((c) => c.id !== a.id) });
    case "addGroup":
      return edit({ groups: [...s.groups, a.group] });
    case "renameGroup":
      return edit({ groups: s.groups.map((g) => (g.id === a.id ? { ...g, name: a.name } : g)) });
    case "deleteGroup":
      return edit({
        groups: s.groups.filter((g) => g.id !== a.id),
        cards: s.cards.map((c) => (c.g === a.id ? { ...c, g: "" } : c)),
      });
    case "import":
      return edit({ groups: [...s.groups, ...a.groups], cards: [...a.cards, ...s.cards] });
    case "dismissStarter":
      return edit({ starter: false });
    default:
      return s;
  }
}

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  // loading | saved | saving | error | locked | offline
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const stateRef = useRef(state);
  stateRef.current = state;
  const savingRef = useRef(false);
  const retryRef = useRef(null);

  const boot = useCallback(async () => {
    setStatus("loading");
    try {
      const st = await api.getState();
      if (!st.seeded) {
        dispatch({ type: "seed", data: makeStarter() });
      } else {
        dispatch({ type: "loaded", groups: st.groups, cards: st.cards, starter: !!st.starter });
        setStatus("saved");
      }
    } catch (e) {
      if (e.status === 401) setStatus("locked");
      else {
        setLoadError(e.message);
        setStatus("offline");
      }
    }
  }, []);

  useEffect(() => {
    boot();
  }, [boot]);

  const flush = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    const snapshot = stateRef.current;
    try {
      await api.saveState({ groups: snapshot.groups, cards: snapshot.cards, starter: snapshot.starter });
      savingRef.current = false;
      if (stateRef.current.rev !== snapshot.rev) flush(); // edited while saving
      else setStatus("saved");
    } catch (e) {
      savingRef.current = false;
      if (e.status === 401) {
        api.setToken("");
        setStatus("locked");
        return;
      }
      setStatus("error");
      clearTimeout(retryRef.current);
      retryRef.current = setTimeout(flush, 5000);
    }
  }, []);

  useEffect(() => {
    if (!state.loaded || state.rev === 0) return undefined;
    setStatus("saving");
    const t = setTimeout(flush, 500);
    return () => clearTimeout(t);
  }, [state.rev, state.loaded, flush]);

  useEffect(() => {
    if (status !== "saving" && status !== "error") return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const actions = useMemo(
    () => ({
      addCard: (ko, en, g) => dispatch({ type: "addCard", card: { id: uid(), ko, en, g: g || "" } }),
      updateCard: (id, patch) => dispatch({ type: "updateCard", id, patch }),
      deleteCard: (id) => dispatch({ type: "deleteCard", id }),
      addGroup: (name) => dispatch({ type: "addGroup", group: { id: uid(), name } }),
      renameGroup: (id, name) => dispatch({ type: "renameGroup", id, name }),
      deleteGroup: (id) => dispatch({ type: "deleteGroup", id }),
      dismissStarter: () => dispatch({ type: "dismissStarter" }),
      // `plan` comes from planImport(). New groups get ids here and cards point at them.
      importCards: (plan, existingGroups) => {
        const byName = {};
        existingGroups.forEach((g) => (byName[g.name.toLowerCase()] = g.id));
        const groups = plan.newGroups.map((name) => {
          const g = { id: uid(), name };
          byName[name.toLowerCase()] = g.id;
          return g;
        });
        const cards = plan.add.map((r) => ({ id: uid(), ko: r.ko, en: r.en, g: r.cat ? byName[r.cat.toLowerCase()] : "" }));
        dispatch({ type: "import", groups, cards });
      },
      unlock: async (password) => {
        const r = await api.login(password);
        api.setToken(r.token);
        await boot();
      },
      retryLoad: boot,
    }),
    [boot]
  );

  const value = useMemo(
    () => ({ groups: state.groups, cards: state.cards, starter: state.starter, loaded: state.loaded, status, loadError, ...actions }),
    [state.groups, state.cards, state.starter, state.loaded, status, loadError, actions]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
