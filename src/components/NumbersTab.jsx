// Pure Korean numbers 0-99, in both directions.
import { buildNumberQuestions } from "../lib/questions.js";
import { shuffle } from "../lib/util.js";
import { NUMBER_DIRECTIONS, NUMBER_RANGES, REFERENCE } from "../lib/numbers.js";
import RunFlow from "./RunFlow.jsx";
import { Seg } from "./Common.jsx";

const COUNTS = [
  { value: "10", label: "10 questions" },
  { value: "20", label: "20 questions" },
  { value: "50", label: "50 questions" },
  { value: "all", label: "Every number in the range" },
];

export default function NumbersTab({ prefs, setPrefs }) {
  return <RunFlow build={(config) => buildNumberQuestions(config.items, config.dir)} renderSetup={(start) => <Setup prefs={prefs} setPrefs={setPrefs} onStart={start} />} />;
}

function Setup({ prefs, setPrefs, onStart }) {
  const range = NUMBER_RANGES.find((r) => r.id === prefs.range) || NUMBER_RANGES[3];
  const direction = NUMBER_DIRECTIONS.find((d) => d.id === prefs.dir) || NUMBER_DIRECTIONS[0];
  const available = range.numbers();
  const asked = prefs.count === "all" ? available.length : Math.min(Number(prefs.count), available.length);

  function start() {
    const pickedNumbers = shuffle(available).slice(0, asked);
    onStart({ items: pickedNumbers, dir: direction.id, name: `Numbers ${range.label.replace(/ \(.*\)/, "")}`, detail: direction.label });
  }

  return (
    <section>
      <h2>
        Pure Korean numbers <span className="sub">(하나, 둘, 셋…)</span>
      </h2>
      <div className="setup-grid">
        <Seg
          legend="Direction"
          name="ndir"
          value={direction.id}
          onChange={(dir) => setPrefs({ dir })}
          options={NUMBER_DIRECTIONS.map((d) => ({
            value: d.id,
            label: (
              <>
                {d.label} <span className="sub">· {d.hint}</span>
              </>
            ),
          }))}
        />
        <label htmlFor="nRange">
          Range
          <select id="nRange" value={range.id} onChange={(e) => setPrefs({ range: e.target.value })}>
            {NUMBER_RANGES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="nCount">
          Length
          <select id="nCount" value={prefs.count} onChange={(e) => setPrefs({ count: e.target.value })}>
            {COUNTS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <p className="sub">
          {asked} {asked === 1 ? "number" : "numbers"} this round, in random order. Both plain and counter forms are accepted (스물 or 스무).
        </p>
        <button type="button" className="btn primary big" onClick={start}>
          Start practice
        </button>
      </div>
      <Chart />
    </section>
  );
}

function Chart() {
  return (
    <details className="imp">
      <summary>Number chart</summary>
      <div className="inner">
        <p className="sub">
          Join a tens word and a ones word with no space: <span lang="ko">스물</span> + <span lang="ko">일곱</span> = <span lang="ko">스물일곱</span> (27). Before a counter
          word (명, 개, 살…) 1–4 and 20 change shape, shown in brackets.
        </p>
        <div className="chart">
          <table>
            <caption>Ones</caption>
            <tbody>
              {REFERENCE.ones.map((r) => (
                <tr key={r.n}>
                  <th scope="row">{r.n}</th>
                  <td lang="ko">{r.ko}</td>
                  <td lang="ko" className="alt">
                    {r.counter !== r.ko ? `(${r.counter})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <caption>Tens</caption>
            <tbody>
              {REFERENCE.tens.map((r) => (
                <tr key={r.n}>
                  <th scope="row">{r.n}</th>
                  <td lang="ko">{r.ko}</td>
                  <td lang="ko" className="alt">
                    {r.counter !== r.ko ? `(${r.counter})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="sub">There is no native word for zero. Use 영 (or 공).</p>
      </div>
    </details>
  );
}
