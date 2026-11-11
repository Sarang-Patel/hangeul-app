// Small shared pieces used by several tabs.
import { useStore } from "../store.jsx";
import { groupName, pool } from "../lib/selectors.js";

// A fieldset of radio buttons drawn as stacked option rows.
export function Seg({ legend, name, value, onChange, options }) {
  return (
    <fieldset className="seg">
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} htmlFor={`${name}-${o.value}`}>
          <input
            type="radio"
            name={name}
            id={`${name}-${o.value}`}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

// <option> list of groups with card counts. `ungrouped`: "always" | "ifAny" | false.
export function GroupOptions({ withAll, ungrouped }) {
  const { groups, cards } = useStore();
  const none = pool(cards, groups, "__none").length;
  return (
    <>
      {withAll && <option value="all">All cards ({cards.length})</option>}
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name} ({pool(cards, groups, g.id).length})
        </option>
      ))}
      {(ungrouped === "always" || (ungrouped === "ifAny" && none > 0)) && <option value="__none">Ungrouped ({none})</option>}
    </>
  );
}

export function StarterNote() {
  const { starter, dismissStarter } = useStore();
  if (!starter) return null;
  return (
    <div className="note">
      <span>The starter cards are examples. Edit or delete them whenever you like.</span>
      <button type="button" className="btn sm" onClick={dismissStarter}>
        Got it
      </button>
    </div>
  );
}

export { groupName };
