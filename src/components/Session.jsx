// One practice round. Works with any list of questions (see lib/questions.js).
import { useEffect, useRef, useState } from "react";

const wordClass = (lang) => (lang === "ko" ? "ko" : lang === "num" ? "num" : "en");
const langAttr = (lang) => (lang === "num" ? undefined : lang);

export default function Session({ questions, onFinish, onExit }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [res, setRes] = useState(null); // null until answered, then { ok, overruled, input, skipped, picked }
  const q = questions[i];
  const total = questions.length;
  const last = i === total - 1;

  function record(result) {
    if (res) return;
    setRes(result);
    if (result.ok) setScore((s) => s + 1);
    else setMissed((m) => [...m, q]);
  }

  function overrule() {
    setRes({ ...res, ok: true, overruled: true });
    setScore((s) => s + 1);
    setMissed((m) => m.filter((x) => x.id !== q.id));
  }

  function next() {
    if (last) onFinish({ score, total, missed });
    else {
      setI(i + 1);
      setRes(null);
    }
  }

  function pick(index) {
    if (res || !q.options?.[index]) return;
    record({ ok: q.options[index].correct, picked: index });
  }

  // Keys 1-4 pick an option in multiple choice.
  useEffect(() => {
    if (!q.options || res) return undefined;
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= q.options.length) {
        e.preventDefault();
        pick(n - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, res]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="session">
      <div className="topline">
        <button type="button" className="link" onClick={onExit}>
          ← End session
        </button>
        <span className="count">
          {i + 1} / {total} · {score} correct
        </span>
      </div>
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${(i / total) * 100}%` }} />
      </div>

      <div className="prompt">
        <span className="tag">{q.tag}</span>
        <div className={`word ${wordClass(q.promptLang)}`} lang={langAttr(q.promptLang)}>
          {q.prompt}
        </div>
      </div>

      {q.options ? (
        <div className="choices" role="group" aria-label="Answer options">
          {q.options.map((o, idx) => {
            let state = "";
            if (res) state = o.correct ? "good" : idx === res.picked ? "bad" : "dim";
            return (
              <button key={idx} type="button" className={`opt ${state}`} disabled={!!res} onClick={() => pick(idx)}>
                <span className="n" aria-hidden="true">
                  {idx + 1}
                </span>
                <span className="t" lang={langAttr(q.answerLang)}>
                  {o.text}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <TypeForm key={i} q={q} locked={!!res} onSubmit={(text) => record({ ok: q.check(text), input: text })} onSkip={() => record({ ok: false, skipped: true })} />
      )}

      <div aria-live="polite">
        {res && <Feedback q={q} res={res} last={last} onNext={next} onOverrule={overrule} />}
      </div>
    </section>
  );
}

function TypeForm({ q, locked, onSubmit, onSkip }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  useEffect(() => ref.current?.focus(), []);

  function submit(e) {
    e.preventDefault();
    if (locked) return;
    if (!text.trim()) return ref.current?.focus();
    onSubmit(text);
  }

  return (
    <form onSubmit={submit} autoComplete="off">
      <div className="answer-row">
        <input
          ref={ref}
          type="text"
          lang={q.input.lang}
          inputMode={q.input.inputMode}
          aria-label={q.input.label}
          placeholder={q.input.placeholder}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={locked}
          value={text}
          onChange={(e) => setText(e.target.value)}
          // Enter that only confirms a Korean IME composition must not submit the form.
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault();
          }}
        />
        <button type="submit" className="btn primary" disabled={locked}>
          Check
        </button>
        <button type="button" className="btn" disabled={locked} onClick={onSkip}>
          Don't know
        </button>
      </div>
    </form>
  );
}

function Feedback({ q, res, last, onNext, onOverrule }) {
  const nextRef = useRef(null);
  useEffect(() => nextRef.current?.focus(), []);
  const typedWrong = !res.ok && !res.skipped && res.picked === undefined;
  const title = res.ok ? (res.overruled ? "Marked as correct" : "Correct") : res.skipped ? "The answer" : "Not quite";

  return (
    <>
      <div className={`fb ${res.ok ? "good" : "bad"}`}>
        <strong>{title}</strong>
        <span className="ans" lang={langAttr(q.answerLang)}>
          {q.answer}
        </span>
        {typedWrong && (
          <span className="you">
            You wrote: <span lang={q.input.lang}>{res.input}</span>
          </span>
        )}
        {q.note && <span className="you">{q.note}</span>}
        {typedWrong && (
          <div className="fb-actions">
            <button type="button" className="btn sm" onClick={onOverrule}>
              I was right
            </button>
          </div>
        )}
      </div>
      <div className="fb-actions">
        <button ref={nextRef} type="button" className="btn primary" onClick={onNext}>
          {last ? "See results" : "Next card"}
        </button>
      </div>
    </>
  );
}
