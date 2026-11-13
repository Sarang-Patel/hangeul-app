// Sino-Korean numbers (일, 이, 삼 ...), practised by everyday situation, in both directions.
import { SINO_DIRECTIONS, SINO_GROUPS, SINO_REFERENCE, generateItems, sinoCategory } from "../lib/sino.js";
import { buildSinoQuestions } from "../lib/questions.js";
import { Seg } from "./Common.jsx";
import RunFlow from "./RunFlow.jsx";

const COUNTS = ["10", "20", "50"];

export default function SinoTab({ prefs, setPrefs }) {
  return (
    <RunFlow
      build={(config) => buildSinoQuestions(config.items, config.dir)}
      renderSetup={(start) => <Setup prefs={prefs} setPrefs={setPrefs} onStart={start} />}
    />
  );
}

function Setup({ prefs, setPrefs, onStart }) {
  const category = sinoCategory(prefs.cat);
  const direction = SINO_DIRECTIONS.find((d) => d.id === prefs.dir) || SINO_DIRECTIONS[0];
  const asked = Math.min(Number(prefs.count), category.size);

  function start() {
    onStart({
      items: generateItems(category, asked),
      dir: direction.id,
      name: `Sino-Korean · ${category.label}`,
      detail: direction.label,
    });
  }

  return (
    <section>
      <h2>
        Sino-Korean numbers <span className="sub">(일, 이, 삼…)</span>
      </h2>
      <div className="setup-grid">
        <Seg
          legend="Direction"
          name="sdir"
          value={direction.id}
          onChange={(dir) => setPrefs({ dir })}
          options={SINO_DIRECTIONS.map((d) => ({
            value: d.id,
            label: (
              <>
                {d.label} <span className="sub">· {d.hint}</span>
              </>
            ),
          }))}
        />
        <label htmlFor="sCat">
          Category
          <select id="sCat" value={category.id} onChange={(e) => setPrefs({ cat: e.target.value })}>
            {SINO_GROUPS.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="sub why">{category.why}</p>
        <label htmlFor="sCount">
          Length
          <select id="sCount" value={prefs.count} onChange={(e) => setPrefs({ count: e.target.value })}>
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c} questions
              </option>
            ))}
          </select>
        </label>
        <p className="sub">
          {asked} random {asked === 1 ? "number" : "numbers"} each round, so every round is different.
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
      <summary>Sino-Korean chart and rules</summary>
      <div className="inner">
        <div className="chart">
          <table>
            <caption>Digits</caption>
            <tbody>
              {SINO_REFERENCE.digits.map((r) => (
                <tr key={r.n}>
                  <th scope="row">{r.n}</th>
                  <td lang="ko">{r.ko}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <caption>Places</caption>
            <tbody>
              {SINO_REFERENCE.places.map((r) => (
                <tr key={r.n}>
                  <th scope="row">{r.n}</th>
                  <td lang="ko">{r.ko}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="rules">
          <li>
            Drop <span lang="ko">일</span> before <span lang="ko">십 백 천</span>: 110 is <span lang="ko">백십</span>, not <span lang="ko">일백일십</span>.
          </li>
          <li>
            Group by <span lang="ko">만</span> (10,000), not by thousands: 35,000 is <span lang="ko">삼만 오천</span>, 1,500,000 is <span lang="ko">백오십만</span>.
          </li>
          <li>
            10,000 is <span lang="ko">만</span>. 100,000,000 is <span lang="ko">일억</span>.
          </li>
          <li>
            Zero is <span lang="ko">영</span> when counting and <span lang="ko">공</span> in phone numbers.
          </li>
          <li>
            June is <span lang="ko">유월</span> and October is <span lang="ko">시월</span>.
          </li>
          <li>Use Sino-Korean for dates, money, phone numbers, minutes, floors, years and percentages. Use pure Korean for counting things, ages and clock hours.</li>
        </ul>
      </div>
    </details>
  );
}
