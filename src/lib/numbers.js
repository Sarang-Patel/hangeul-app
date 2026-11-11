// Pure Korean (native) numbers, 0-99.
//
// Native Korean has no word for zero, so 0 uses 영 (Sino-Korean), with 공 also accepted.
// Before a counter word, 1-4 and 20 change shape (하나 -> 한, 둘 -> 두, 셋 -> 세, 넷 -> 네, 스물 -> 스무).
// Both the plain and the counter forms are accepted as answers.

const ONES = ["", "하나", "둘", "셋", "넷", "다섯", "여섯", "일곱", "여덟", "아홉"];
const ONES_BEFORE_COUNTER = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉"];
const TENS = ["", "열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];
const TENS_ALONE_BEFORE_COUNTER = ["", "열", "스무", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"];

export const ZERO_NOTE = "Pure Korean has no word for zero. 영 (or 공) is borrowed from the Sino-Korean numbers.";

// All accepted spellings. The first one is the standard form shown to the learner.
export function nativeForms(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) throw new RangeError("Only 0-99 is supported");
  if (n === 0) return ["영", "공"];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const standard = TENS[tens] + ONES[ones];
  const beforeCounter = ones === 0 ? TENS_ALONE_BEFORE_COUNTER[tens] : TENS[tens] + ONES_BEFORE_COUNTER[ones];
  return standard === beforeCounter ? [standard] : [standard, beforeCounter];
}

export const nativeKorean = (n) => nativeForms(n)[0];

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const NUMBER_RANGES = [
  { id: "1-10", label: "1 – 10", numbers: () => range(1, 10) },
  { id: "0-20", label: "0 – 20", numbers: () => range(0, 20) },
  { id: "0-50", label: "0 – 50", numbers: () => range(0, 50) },
  { id: "0-99", label: "0 – 99 (everything)", numbers: () => range(0, 99) },
  { id: "tens", label: "Tens only: 10, 20 … 90", numbers: () => range(1, 9).map((t) => t * 10) },
];

export const NUMBER_DIRECTIONS = [
  { id: "ko-num", label: "Korean → number", hint: "See the Korean word, type the number" },
  { id: "num-ko", label: "Number → Korean", hint: "See the number, type the Korean word" },
];

// Reference tables for the chart on the Numbers tab.
export const REFERENCE = {
  ones: range(1, 9).map((n) => ({ n, ko: ONES[n], counter: ONES_BEFORE_COUNTER[n] })),
  tens: range(1, 9).map((t) => ({ n: t * 10, ko: TENS[t], counter: TENS_ALONE_BEFORE_COUNTER[t] })),
};
