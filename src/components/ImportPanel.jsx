import { useState } from "react";
import { MAX_FILE_BYTES, parseImport, planImport } from "../lib/importer.js";
import { plural } from "../lib/util.js";
import { useStore } from "../store.jsx";

const TEXT_EXAMPLE = "category - english - korean\nGreetings - hello - 안녕하세요\nFood - rice / meal - 밥";
const JSON_EXAMPLE = `[
  { "category": "Greetings", "english": "hello", "korean": "안녕하세요" },
  { "category": "Food", "english": "rice / meal", "korean": "밥" }
]`;

export default function ImportPanel() {
  const { groups, cards, importCards } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [plan, setPlan] = useState(null);
  const [msg, setMsg] = useState("");
  const [fileKey, setFileKey] = useState(0); // changing it clears the file input

  function preview(source = text) {
    setOpen(true);
    setMsg("");
    setPlan(planImport(parseImport(source), { groups, cards }));
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOpen(true);
    if (file.size > MAX_FILE_BYTES) return setMsg("That file is over 2 MB.");
    try {
      const content = await file.text();
      setText(content);
      preview(content);
    } catch {
      setMsg("Could not read that file.");
    }
  }

  function clear() {
    setText("");
    setPlan(null);
    setMsg("");
    setFileKey((k) => k + 1);
  }

  function apply() {
    if (!plan || !plan.add.length || plan.blocked) return;
    importCards(plan, groups);
    const made = plan.newGroups.length;
    setMsg(`Imported ${plural(plan.add.length)}${made ? ` and created ${made} ${made === 1 ? "group" : "groups"}` : ""}.`);
    setText("");
    setPlan(null);
    setFileKey((k) => k + 1);
  }

  return (
    <section>
      <details className="imp" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>Import cards from a file</summary>
        <div className="inner">
          <p className="sub">Upload a .txt or .json file, or paste text below. Text files use one card per line, in this order:</p>
          <pre className="fmt" lang="ko">{TEXT_EXAMPLE}</pre>
          <p className="sub">
            Each category becomes a group, created if it does not exist. A tab also works as the separator, and lines starting with # are ignored. Cards that already exist with the
            same category, English and Korean are skipped.
          </p>
          <p className="sub">
            For JSON, use a list of objects. Leave out <em>category</em> to import ungrouped cards.
          </p>
          <pre className="fmt" lang="ko">{JSON_EXAMPLE}</pre>
          <label htmlFor="importFile">
            Choose a file
            <input key={fileKey} type="file" id="importFile" accept=".txt,.json,text/plain,application/json" onChange={onFile} />
          </label>
          <label htmlFor="importText">
            Or paste here
            <textarea id="importText" lang="ko" spellCheck={false} placeholder="Greetings - hello - 안녕하세요" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <div className="acts">
            <button type="button" className="btn" onClick={() => preview()}>
              Preview
            </button>
            <button type="button" className="btn sm" onClick={clear}>
              Clear
            </button>
          </div>
          {plan && <Preview plan={plan} onImport={apply} />}
          <p className="msg" role="status">
            {msg}
          </p>
        </div>
      </details>
    </section>
  );
}

function Preview({ plan, onImport }) {
  const { add, dups, newGroups, errors, blocked } = plan;
  return (
    <div className="pv" aria-live="polite">
      {add.length ? (
        <>
          <p>
            <strong>{plural(add.length)} ready to import.</strong>
          </p>
          <p className="sub">
            {newGroups.length ? `New ${newGroups.length === 1 ? "group" : "groups"}: ${newGroups.join(", ")}. ` : "No new groups. "}
            {dups ? `${plural(dups)} already exist and will be skipped.` : ""}
          </p>
          <ul className="list">
            {add.slice(0, 5).map((r, i) => (
              <li className="row" key={i}>
                <span className="ko" lang="ko">
                  {r.ko}
                </span>
                <span className="en">{r.en}</span>
                <div className="meta">
                  <span className="chip">{r.cat || "Ungrouped"}</span>
                </div>
              </li>
            ))}
          </ul>
          {add.length > 5 && <p className="sub">and {add.length - 5} more.</p>}
        </>
      ) : (
        <p>
          <strong>No new cards to import.</strong> {dups ? `${plural(dups)} already exist.` : ""}
        </p>
      )}
      {errors.length > 0 && (
        <>
          <p className="warn">
            {errors.length} {errors.length === 1 ? "line was" : "lines were"} skipped:
          </p>
          <ul className="errs">
            {errors.slice(0, 8).map((m, i) => (
              <li key={i}>{m}</li>
            ))}
            {errors.length > 8 && <li>and {errors.length - 8} more</li>}
          </ul>
        </>
      )}
      {blocked && <p className="warn">{blocked}</p>}
      {add.length > 0 && !blocked && (
        <div className="acts">
          <button type="button" className="btn primary" onClick={onImport}>
            Import {plural(add.length)}
          </button>
        </div>
      )}
    </div>
  );
}
