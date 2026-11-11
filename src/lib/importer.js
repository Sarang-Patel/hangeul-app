// Parsing and planning for "Import cards from a file".
//   text:  category - english - korean   (one per line, tabs also work)
//   JSON:  [{ "category": "...", "english": "...", "korean": "..." }]  or  { "cards": [...] }
import { groupName } from "./selectors.js";

export const MAX_CARDS = 5000;
export const MAX_GROUPS = 200;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;

const dupKey = (cat, ko, en) => `${String(cat || "").toLowerCase()}\u0001${ko.normalize("NFC")}\u0001${en.toLowerCase()}`;
const pick = (o, names) => {
  for (const n of names) if (o[n] != null) return o[n];
  return "";
};
const str = (v) => (v == null ? "" : String(v)).trim();

export function parseImport(raw) {
  const text = String(raw).replace(/^﻿/, "").trim();
  const rows = [];
  const errors = [];
  if (!text) return { rows, errors: ["Nothing to import. Choose a file or paste some text."] };

  if (/^[[{]/.test(text)) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return { rows, errors: [`This looks like JSON but could not be read: ${e.message}`] };
    }
    const list = Array.isArray(data) ? data : data && Array.isArray(data.cards) ? data.cards : null;
    if (!list) return { rows, errors: ['Expected a list of cards, or an object with a "cards" list.'] };
    list.forEach((o, i) => {
      if (!o || typeof o !== "object" || Array.isArray(o)) {
        errors.push(`Item ${i + 1}: expected an object with english and korean.`);
        return;
      }
      rows.push({
        cat: pick(o, ["category", "group"]),
        en: pick(o, ["english", "en"]),
        ko: pick(o, ["korean", "ko"]),
        at: `Item ${i + 1}`,
      });
    });
  } else {
    text.split(/\r?\n/).forEach((line, i) => {
      const l = line.trim();
      if (!l || l.startsWith("#")) return;
      const parts = (l.includes("\t") ? l.split("\t") : l.split(/\s[-–—]\s/)).map((x) => x.trim());
      if (parts.length < 3) {
        errors.push(`Line ${i + 1}: expected category - english - korean.`);
        return;
      }
      const cat = parts[0];
      const ko = parts[parts.length - 1];
      const en = parts.slice(1, -1).join(" - ");
      if (/^category$/i.test(cat) && /^english$/i.test(en) && /^korean$/i.test(ko)) return; // header row
      rows.push({ cat, en, ko, at: `Line ${i + 1}` });
    });
  }
  return { rows, errors };
}

// Decides what an import would do, without changing anything.
export function planImport(parsed, { groups, cards }) {
  const errors = parsed.errors.slice();
  const add = [];
  const known = new Set(groups.map((g) => g.name.toLowerCase()));
  const existing = new Set(cards.map((c) => dupKey(groupName(groups, c.g), c.ko, c.en)));
  const seen = new Set();
  const newGroups = [];
  const newKeys = new Set();
  let dups = 0;

  parsed.rows.forEach((r) => {
    const cat = str(r.cat);
    const ko = str(r.ko);
    const en = str(r.en);
    if (!ko || !en) return errors.push(`${r.at}: both english and korean are needed.`);
    if (ko.length > 200 || en.length > 200) return errors.push(`${r.at}: text is longer than 200 characters.`);
    if (cat.length > 80) return errors.push(`${r.at}: category is longer than 80 characters.`);
    const k = dupKey(cat, ko, en);
    if (existing.has(k) || seen.has(k)) {
      dups++;
      return;
    }
    seen.add(k);
    const lc = cat.toLowerCase();
    if (cat && !known.has(lc) && !newKeys.has(lc)) {
      newKeys.add(lc);
      newGroups.push(cat);
    }
    add.push({ cat, ko, en });
  });

  let blocked = "";
  if (cards.length + add.length > MAX_CARDS) blocked = `That would go over the limit of ${MAX_CARDS} cards.`;
  else if (groups.length + newGroups.length > MAX_GROUPS) blocked = `That would go over the limit of ${MAX_GROUPS} groups.`;
  return { add, dups, newGroups, errors, blocked };
}
