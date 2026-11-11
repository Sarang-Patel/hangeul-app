// Helpers for reading cards and groups. `sel` is "all", "__none" (ungrouped) or a group id.
export const groupName = (groups, id) => (groups.find((g) => g.id === id) || {}).name || "";

export function validSel(groups, sel) {
  return sel === "all" || sel === "__none" || groups.some((g) => g.id === sel) ? sel : "all";
}

export function pool(cards, groups, sel) {
  if (sel === "all") return cards;
  if (sel === "__none") return cards.filter((c) => !c.g || !groupName(groups, c.g));
  return cards.filter((c) => c.g === sel);
}
