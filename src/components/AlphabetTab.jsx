// Alphabet practice in three levels: letters, syllables, words.
// Always multiple choice, Korean -> romanization, in random order.
import { CHART, LEVELS, levelOf, setOf } from "../lib/hangul.js";
import { buildAlphabetQuestions } from "../lib/questions.js";
import { shuffle } from "../lib/util.js";
import { Seg } from "./Common.jsx";
import RunFlow from "./RunFlow.jsx";

const COUNTS = ["10", "20", "50", "100"];

export default function AlphabetTab({ prefs, setPrefs }) {
  return (
    <RunFlow
      build={(config) => buildAlphabetQuestions(config.items, config.pool)}
      renderSetup={(start) => <Setup prefs={prefs} setPrefs={setPrefs} onStart={start} />}
    />
  );
}

function Setup({ prefs, setPrefs, onStart }) {
  const level = levelOf(prefs.level);
  const set = setOf(level, prefs.set);
  const pool = set.items();
  const asked = Math.min(Number(prefs.count), pool.length);

  function start() {
    onStart({
      items: shuffle(pool).slice(0, asked),
      pool,
      name: `${level.label}${level.sets.length > 1 ? ` · ${set.label.replace(/ \(.*\)/, "")}` : ""}`,
      detail: "Korean → romanization · Multiple choice",
    });
  }

  return (
    <section>
      <h2>
        Alphabet <span className="sub">(한글)</span>
      </h2>
      <div className="setup-grid">
        <Seg
          legend="Level"
          name="alevel"
          value={level.id}
          onChange={(id) => setPrefs({ level: id, set: levelOf(id).sets[0].id })}
          options={LEVELS.map((l, i) => ({
            value: l.id,
            label: (
              <>
                {i + 1}. {l.label} <span className="sub">· {l.hint}</span>
              </>
            ),
          }))}
        />
        {level.sets.length > 1 && (
          <label htmlFor="aSet">
            Practice set
            <select id="aSet" value={set.id} onChange={(e) => setPrefs({ set: e.target.value })}>
              {level.sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        <label htmlFor="aCount">
          Length
          <select id="aCount" value={prefs.count} onChange={(e) => setPrefs({ count: e.target.value })}>
            {COUNTS.map((c) => (
              <option key={c} value={c}>
                {c} questions
              </option>
            ))}
          </select>
        </label>
        <p className="sub">
          {asked} of {pool.length} {pool.length === 1 ? "item" : "items"} this round, in random order. You see the Korean and pick its romanization from 4 options.
        </p>
        <button type="button" className="btn primary big" onClick={start}>
          Start practice
        </button>
      </div>
      <Chart />
    </section>
  );
}

function ChartTable({ title, rows }) {
  return (
    <table>
      <caption>{title}</caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <th scope="row" lang="ko">
              {r.text}
            </th>
            <td>{r.roman}</td>
            <td className="alt">{r.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Chart() {
  return (
    <details className="imp">
      <summary>Letter chart</summary>
      <div className="inner">
        <p className="sub">
          Letters are written together in blocks: a consonant, a vowel, and sometimes a final consonant. <span lang="ko">ㄱ</span> + <span lang="ko">ㅏ</span> = <span lang="ko">가</span> (ga), and{" "}
          <span lang="ko">가</span> + <span lang="ko">ㅇ</span> = <span lang="ko">강</span> (gang).
        </p>
        <div className="chart letters">
          <ChartTable title="Consonants" rows={CHART.consonants} />
          <ChartTable title="Vowels" rows={CHART.vowels} />
        </div>
      </div>
    </details>
  );
}
