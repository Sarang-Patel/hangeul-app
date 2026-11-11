import { useRef, useState } from "react";
import { groupName, pool, validSel } from "../lib/selectors.js";
import { useStore } from "../store.jsx";
import { GroupOptions, StarterNote } from "./Common.jsx";
import ImportPanel from "./ImportPanel.jsx";

export default function CardsTab() {
  return (
    <>
      <AddCard />
      <ImportPanel />
      <CardList />
    </>
  );
}

function AddCard() {
  const { groups, addCard } = useStore();
  const [ko, setKo] = useState("");
  const [en, setEn] = useState("");
  const [group, setGroup] = useState("");
  const [msg, setMsg] = useState("");
  const koRef = useRef(null);
  const groupValue = groups.some((g) => g.id === group) ? group : "";

  function submit(e) {
    e.preventDefault();
    const k = ko.trim();
    const n = en.trim();
    if (!k || !n) return;
    addCard(k, n, groupValue);
    setKo("");
    setEn("");
    setMsg(`Added ${k} — ${n}`);
    koRef.current?.focus();
  }

  return (
    <section>
      <h2>Add a card</h2>
      <StarterNote />
      <form onSubmit={submit} autoComplete="off">
        <div className="form-row">
          <label htmlFor="ko">
            Korean
            <input ref={koRef} type="text" id="ko" lang="ko" placeholder="안녕하세요" required value={ko} onChange={(e) => setKo(e.target.value)} />
          </label>
          <label htmlFor="en">
            English
            <input type="text" id="en" placeholder="hello" required value={en} onChange={(e) => setEn(e.target.value)} />
          </label>
          <label htmlFor="grp">
            Group
            <select id="grp" value={groupValue} onChange={(e) => setGroup(e.target.value)}>
              <option value="">Ungrouped</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn primary">
            Add card
          </button>
        </div>
      </form>
      <p className="sub">
        Separate alternative English answers with a slash, like <em>rice / meal</em>. Any one of them counts.
      </p>
      <p className="msg" role="status">
        {msg}
      </p>
    </section>
  );
}

function CardList() {
  const { cards, groups } = useStore();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const sel = validSel(groups, filter);
  const shown = pool(cards, groups, sel);

  return (
    <section>
      <div className="head-row">
        <h2>Your cards · {shown.length}</h2>
        <label htmlFor="cardFilter">
          Show
          <select
            id="cardFilter"
            value={sel}
            onChange={(e) => {
              setFilter(e.target.value);
              setEditing(null);
              setConfirm(null);
            }}
          >
            <GroupOptions withAll ungrouped="ifAny" />
          </select>
        </label>
      </div>
      <ul className="list">
        {shown.length === 0 && <li className="empty">No cards here yet. Add one above.</li>}
        {shown.map((c) => {
          if (editing === c.id) return <EditRow key={c.id} card={c} onDone={() => setEditing(null)} />;
          if (confirm === c.id) return <ConfirmRow key={c.id} card={c} onDone={() => setConfirm(null)} />;
          const gn = c.g ? groupName(groups, c.g) : "";
          return (
            <li className="row" key={c.id}>
              <span className="ko" lang="ko">
                {c.ko}
              </span>
              <span className="en">{c.en}</span>
              <div className="meta">
                <span className="chip">{gn || "Ungrouped"}</span>
                <div className="acts">
                  <button type="button" className="btn sm" onClick={() => { setEditing(c.id); setConfirm(null); }}>
                    Edit
                  </button>
                  <button type="button" className="btn sm" onClick={() => { setConfirm(c.id); setEditing(null); }}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function EditRow({ card, onDone }) {
  const { groups, updateCard } = useStore();
  const [ko, setKo] = useState(card.ko);
  const [en, setEn] = useState(card.en);
  const [g, setG] = useState(groups.some((x) => x.id === card.g) ? card.g : "");

  function submit(e) {
    e.preventDefault();
    if (ko.trim() && en.trim()) updateCard(card.id, { ko: ko.trim(), en: en.trim(), g });
    onDone();
  }

  return (
    <li className="row edit">
      <form onSubmit={submit} autoComplete="off">
        <div className="form-row">
          <label htmlFor="edit-ko">
            Korean
            <input type="text" id="edit-ko" lang="ko" autoFocus required value={ko} onChange={(e) => setKo(e.target.value)} />
          </label>
          <label htmlFor="edit-en">
            English
            <input type="text" id="edit-en" required value={en} onChange={(e) => setEn(e.target.value)} />
          </label>
          <label htmlFor="edit-grp">
            Group
            <select id="edit-grp" value={g} onChange={(e) => setG(e.target.value)}>
              <option value="">Ungrouped</option>
              {groups.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="acts" style={{ marginTop: 10 }}>
          <button type="submit" className="btn primary sm">
            Save
          </button>
          <button type="button" className="btn sm" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </li>
  );
}

function ConfirmRow({ card, onDone }) {
  const { deleteCard } = useStore();
  return (
    <li className="row confirm">
      <p>
        Delete <strong lang="ko">{card.ko}</strong> ({card.en})?
      </p>
      <div className="acts">
        <button type="button" className="btn danger sm" onClick={() => deleteCard(card.id)}>
          Delete
        </button>
        <button type="button" className="btn sm" onClick={onDone}>
          Keep
        </button>
      </div>
    </li>
  );
}
