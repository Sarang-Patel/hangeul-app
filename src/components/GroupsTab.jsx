import { useState } from "react";
import { pool } from "../lib/selectors.js";
import { plural } from "../lib/util.js";
import { useStore } from "../store.jsx";

export default function GroupsTab({ onPractice }) {
  const { groups, cards, addGroup } = useStore();
  const [name, setName] = useState("");
  const [msg, setMsg] = useState({ text: "", error: false });
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const ungrouped = pool(cards, groups, "__none").length;

  const exists = (n, exceptId) => groups.some((g) => g.id !== exceptId && g.name.trim().toLowerCase() === n.trim().toLowerCase());

  function submit(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    if (exists(n)) return setMsg({ text: `You already have a group called ${n}.`, error: true });
    addGroup(n);
    setName("");
    setMsg({ text: `Created ${n}.`, error: false });
  }

  return (
    <section>
      <h2>Groups</h2>
      <form onSubmit={submit} autoComplete="off">
        <div className="form-row">
          <label htmlFor="gname">
            New group
            <input type="text" id="gname" placeholder="Travel phrases" required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit" className="btn primary">
            Create group
          </button>
        </div>
      </form>
      <p className={`msg${msg.error ? " err" : ""}`} role="status">
        {msg.text}
      </p>
      <ul className="list">
        {groups.length === 0 && ungrouped === 0 && <li className="empty">No groups yet. Create one above, then assign cards to it.</li>}
        {groups.map((g) => {
          const n = pool(cards, groups, g.id).length;
          if (editing === g.id) return <RenameRow key={g.id} group={g} exists={exists} onDone={() => setEditing(null)} />;
          if (confirm === g.id) return <ConfirmRow key={g.id} group={g} count={n} onDone={() => setConfirm(null)} />;
          return (
            <li className="row" key={g.id}>
              <strong>{g.name}</strong>
              <span className="sub">{plural(n)}</span>
              <div className="meta">
                <span />
                <div className="acts">
                  <button type="button" className="btn sm" disabled={!n} onClick={() => onPractice(g.id)}>
                    Practice
                  </button>
                  <button type="button" className="btn sm" onClick={() => { setEditing(g.id); setConfirm(null); }}>
                    Rename
                  </button>
                  <button type="button" className="btn sm" onClick={() => { setConfirm(g.id); setEditing(null); }}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {ungrouped > 0 && (
          <li className="row">
            <strong>Ungrouped</strong>
            <span className="sub">{plural(ungrouped)}</span>
            <div className="meta">
              <span />
              <div className="acts">
                <button type="button" className="btn sm" onClick={() => onPractice("__none")}>
                  Practice
                </button>
              </div>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}

function RenameRow({ group, exists, onDone }) {
  const { renameGroup } = useStore();
  const [name, setName] = useState(group.name);
  function submit(e) {
    e.preventDefault();
    const n = name.trim();
    if (n && !exists(n, group.id)) {
      renameGroup(group.id, n);
      onDone();
    }
  }
  return (
    <li className="row edit">
      <form onSubmit={submit} autoComplete="off">
        <div className="form-row">
          <label htmlFor="gname-edit">
            Group name
            <input type="text" id="gname-edit" autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
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

function ConfirmRow({ group, count, onDone }) {
  const { deleteGroup } = useStore();
  return (
    <li className="row confirm">
      <p>
        Delete the group <strong>{group.name}</strong>? Its {plural(count)} will stay and become ungrouped.
      </p>
      <div className="acts">
        <button type="button" className="btn danger sm" onClick={() => deleteGroup(group.id)}>
          Delete group
        </button>
        <button type="button" className="btn sm" onClick={onDone}>
          Keep
        </button>
      </div>
    </li>
  );
}
