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
      note: [alternates.length ? `Also accepted: ${alternates.join(", ")}` : "", note].filter(Boolean).join(" "),
      review,
      input: { lang: "ko", label: "Korean number", placeholder: "한국어로 쓰세요", inputMode: "text" },
      check: (text) => forms.map(squash).includes(squash(text)),
      options: null,
    };
  });
}
