// Flashcard practice: pick a group, a mode (type / multiple choice) and a direction.
import { buildCardQuestions, canUseChoice } from "../lib/questions.js";
import { groupName, pool, validSel } from "../lib/selectors.js";
import { plural } from "../lib/util.js";
import { useStore } from "../store.jsx";
import { GroupOptions, Seg, StarterNote } from "./Common.jsx";
import RunFlow from "./RunFlow.jsx";

const MODES = [
  { value: "type", label: "Type the answer" },
  { value: "choice", label: "Multiple choice (4 options)" },
];
const DIRECTIONS = [
  { value: "ko-en", label: <><span lang="ko">한국어</span> → English</> },
  { value: "en-ko", label: <>English → <span lang="ko">한국어</span></> },
];

export default function PracticeTab({ prefs, setPrefs }) {
  const { cards } = useStore();
  const build = (config) => buildCardQuestions(config.items, cards, config.dir, config.mode);
  return <RunFlow build={build} renderSetup={(start) => <Setup prefs={prefs} setPrefs={setPrefs} onStart={start} />} />;
}

function Setup({ prefs, setPrefs, onStart }) {
  const { cards, groups } = useStore();
  const sel = validSel(groups, prefs.group);
  const items = pool(cards, groups, sel);
  const choice = prefs.mode === "choice";
  const choiceOk = canUseChoice(cards, prefs.dir);
  const canStart = items.length > 0 && (!choice || choiceOk);

  function start() {
    if (!canStart) return;
    const groupLabel = sel === "all" ? "All cards" : sel === "__none" ? "Ungrouped" : groupName(groups, sel);
    const dirLabel = prefs.dir === "ko-en" ? "Korean → English" : "English → Korean";
    onStart({ items, dir: prefs.dir, mode: prefs.mode, name: groupLabel, detail: dirLabel + (choice ? " · Multiple choice" : "") });
  }

  return (
    <section>
      <h2>Practice</h2>
      <StarterNote />
      <div className="setup-grid">
        <label htmlFor="pGroup">
          Group
          <select id="pGroup" value={sel} onChange={(e) => setPrefs({ group: e.target.value })}>
            <GroupOptions withAll ungrouped="ifAny" />
          </select>
        </label>
        <Seg legend="Mode" name="mode" value={prefs.mode} onChange={(mode) => setPrefs({ mode })} options={MODES} />
        <Seg legend="Direction" name="dir" value={prefs.dir} onChange={(dir) => setPrefs({ dir })} options={DIRECTIONS} />
        <p className="sub">{items.length ? `${plural(items.length)}, shuffled every round.` : "This group has no cards yet. Add some in the Cards tab."}</p>
        {choice && !choiceOk ? (
          <p className="warn">Multiple choice needs at least 2 cards with different answers. Add more cards first.</p>
        ) : choice && cards.length < 4 ? (
          <p className="sub">You have {plural(cards.length)} in total, so some questions will show fewer than 4 options.</p>
        ) : choice ? (
          <p className="sub">The wrong options come from your other cards, starting with the same group.</p>
        ) : null}
        <button type="button" className="btn primary big" disabled={!canStart} onClick={start}>
          Start practice
        </button>
      </div>
    </section>
  );
}
