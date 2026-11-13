// Builds the list of questions a Session shows. A question looks like:
//   { id, item, tag, prompt, promptLang, answer, answerLang, note?,
//     review: { left, leftLang, right, rightLang },   // shown in the results list
//     input:  { lang, label, placeholder, inputMode },
//     check(text) -> boolean,
//     options: null | [{ text, correct }] }            // present for multiple choice
// To add a new practice type, write another builder that returns this shape.
import { accepted, checkAnswer, key } from "./answers.js";
import { nativeForms, ZERO_NOTE } from "./numbers.js";
import { shuffle } from "./util.js";

/* ---------- flashcards ---------- */

function makeOptions(card, items, allCards, answerOf) {
  const target = answerOf(card);
  const targetKey = key(target);
  const targetAccepted = accepted(target);
  const seen = { [targetKey]: true };
  const wrong = [];
  const add = (list) => {
    shuffle(list).forEach((other) => {
      if (wrong.length >= 3 || other.id === card.id) return;
      const text = answerOf(other);
      const k = key(text);
      if (!k || seen[k] || targetAccepted.includes(k) || accepted(text).includes(targetKey)) return;
      seen[k] = true;
      wrong.push({ text, correct: false });
    });
  };
  add(items); // same group first
  add(allCards);
  return shuffle([...wrong, { text: target, correct: true }]);
}

export function canUseChoice(cards, dir) {
  const answers = new Set(cards.map((c) => key(dir === "ko-en" ? c.en : c.ko)).filter(Boolean));
  return answers.size >= 2;
}

export function buildCardQuestions(items, allCards, dir, mode) {
  const koToEn = dir === "ko-en";
  const answerOf = (c) => (koToEn ? c.en : c.ko);
  return shuffle(items).map((card) => {
    const options = mode === "choice" ? makeOptions(card, items, allCards, answerOf) : null;
    const useOptions = options && options.length >= 2 ? options : null; // too few cards: fall back to typing
    const verb = useOptions ? "Pick" : "Type";
    return {
      id: card.id,
      item: card,
      tag: `${verb} the ${koToEn ? "English" : "Korean"}`,
      prompt: koToEn ? card.ko : card.en,
      promptLang: koToEn ? "ko" : "en",
      answer: answerOf(card),
      answerLang: koToEn ? "en" : "ko",
      review: { left: card.ko, leftLang: "ko", right: card.en, rightLang: "en" },
      input: {
        lang: koToEn ? "en" : "ko",
        label: koToEn ? "English answer" : "Korean answer",
        placeholder: koToEn ? "English meaning" : "한국어로 쓰세요",
        inputMode: "text",
      },
      check: (text) => checkAnswer(answerOf(card), text),
      options: useOptions,
    };
  });
}

/* ---------- native Korean numbers ---------- */

const squash = (s) => String(s).normalize("NFC").replace(/\s+/g, "");

export function buildNumberQuestions(numbers, dir) {
  return shuffle(numbers).map((n) => {
    const forms = nativeForms(n);
    const note = n === 0 ? ZERO_NOTE : "";
    const review = { left: String(n), leftLang: "num", right: forms[0], rightLang: "ko" };
    if (dir === "ko-num") {
      return {
        id: `n${n}`,
        item: n,
        tag: "Type the number",
        prompt: forms[0],
        promptLang: "ko",
        answer: String(n),
        answerLang: "num",
        note,
        review,
        input: { lang: "en", label: "Number", placeholder: "0 – 99", inputMode: "numeric" },
        check: (text) => {
          const t = String(text).normalize("NFKC").trim();
          return /^\d{1,2}$/.test(t) && Number(t) === n;
        },
        options: null,
      };
    }
    const alternates = forms.slice(1);
    return {
      id: `n${n}`,
      item: n,
      tag: "Type the Korean",
      prompt: String(n),
      promptLang: "num",
      answer: forms[0],
      answerLang: "ko",
      note: [alternates.length ? `Also accepted: ${alternates.join(", ")}` : "", note].filter(Boolean).join("\n"),
      review,
      input: { lang: "ko", label: "Korean number", placeholder: "한국어로 쓰세요", inputMode: "text" },
      check: (text) => forms.map(squash).includes(squash(text)),
      options: null,
    };
  });
}

/* ---------- alphabet: letters, syllables, words (multiple choice, Korean -> romanization) ---------- */

const tokens = (roman) => roman.split(" / ");
// "g / k" and "k" share the token "k", so they must not appear together as options.
const clashes = (a, b) => tokens(a).some((t) => tokens(b).includes(t));

function similarity(a, b) {
  if (a.kind === "word") return a.parts.reduce((n, p, i) => n + (b.parts[i] === p ? 1 : 0), 0) + (a.parts.length === b.parts.length ? 1 : 0);
  return a.parts.reduce((n, p, i) => n + (p && b.parts[i] === p ? 1 : 0), 0);
}

function makeAlphabetOptions(item, pool) {
  const others = pool.filter((p) => p.id !== item.id && !clashes(p.roman, item.roman));
  const sameKind = others.filter((p) => p.kind === item.kind);
  const base = sameKind.length >= 3 ? sameKind : others;
  // Look-alikes first (shared initial, vowel, final or syllable), with a random tie-break, plus one random pick.
  const ranked = shuffle(base)
    .map((p) => ({ p, score: similarity(item, p) }))
    .sort((x, y) => y.score - x.score)
    .map((x) => x.p);
  const wrong = [];
  const seen = new Set([item.roman]);
  const take = (p) => {
    if (wrong.length >= 3 || seen.has(p.roman) || wrong.some((w) => clashes(w.text, p.roman))) return;
    seen.add(p.roman);
    wrong.push({ text: p.roman, correct: false });
  };
  ranked.slice(0, 2).forEach(take);
  shuffle(ranked).forEach(take); // fills the rest, including the random pick
  return shuffle([...wrong, { text: item.roman, correct: true }]);
}

// items: what to ask (already a random sample). pool: everything in the set, used for wrong options.
export function buildAlphabetQuestions(items, pool) {
  return shuffle(items).map((item) => ({
    id: item.id,
    item,
    tag: item.kind === "consonant" || item.kind === "vowel" ? "Pick the sound" : "Pick the romanization",
    prompt: item.text,
    promptLang: "ko",
    answer: item.roman,
    answerLang: "en",
    note: item.note,
    review: { left: item.text, leftLang: "ko", right: item.roman, rightLang: "en" },
    input: { lang: "en", label: "Romanization", placeholder: "", inputMode: "text" },
    check: (text) => key(text) === key(item.roman),
    options: makeAlphabetOptions(item, pool),
  }));
}

/* ---------- Sino-Korean numbers by situation (typed, both directions) ---------- */

// Does the typed text contain the numbers this item expects? "35,000원", "35000" and "35 000" all match 35000.
function numbersMatch(item, text) {
  const t = String(text).normalize("NFKC");
  if (item.digits) return t.replace(/\D/g, "") === item.digits;
  const single = item.nums.length === 1;
  const groups = (single ? t.replace(/[,\s]/g, "") : t).match(/\d+/g) || [];
  return [item.nums, ...(item.numsAlts || [])].some((e) => e.length === groups.length && e.every((n, i) => Number(groups[i]) === n));
}

export function buildSinoQuestions(items, dir) {
  return shuffle(items).map((item) => {
    const readings = [item.ko, ...item.alts].map(squash);
    const koToNum = dir === "ko-num";
    const prompt = koToNum ? item.ko : item.display;
    return {
      id: item.id,
      item,
      tag: koToNum ? "Type the number" : "Type the Korean",
      prompt,
      promptLang: koToNum ? "ko" : "num",
      promptLong: prompt.length > 7,
      answer: koToNum ? item.display : item.ko,
      answerLang: koToNum ? "num" : "ko",
      note: [!koToNum && item.alts.length ? `Also accepted: ${item.alts.join(", ")}` : "", item.note].filter(Boolean).join("\n"),
      review: { left: item.display, leftLang: "num", right: item.ko, rightLang: "ko" },
      input: koToNum
        ? { lang: "en", label: "Number", placeholder: item.placeholder, inputMode: item.nums.length > 1 || item.digits ? "text" : "numeric" }
        : { lang: "ko", label: "Korean reading", placeholder: "한국어로 쓰세요", inputMode: "text" },
      check: koToNum ? (text) => numbersMatch(item, text) : (text) => readings.includes(squash(text)),
      options: null,
    };
  });
}
