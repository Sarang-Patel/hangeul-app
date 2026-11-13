// Sino-Korean numbers (일, 이, 삼 ...) and the everyday situations where they are used.
//
// Numbers can't be practised one by one past a few hundred, so practice is organised by situation:
// each category generates random, realistic values (prices, years, dates, phone numbers ...).
// An item looks like:
//   { id, display, ko, alts, nums, numsAlts?, digits?, note?, placeholder }
//   display: the number side ("35,000원")   ko: standard reading ("삼만 오천 원")   alts: other accepted readings
//   nums: values the typed number must contain (e.g. [6, 15] for 6월 15일)   digits: phone numbers, compared digit by digit

const DIGIT = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
const PHONE_DIGIT = ["공", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];

// 0-9999 with the spoken rules: 일 is dropped before 십, 백 and 천 (십, not 일십).
function under10000(n) {
  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor(n / 100) % 10;
  const tens = Math.floor(n / 10) % 10;
  const ones = n % 10;
  let s = "";
  if (thousands) s += (thousands === 1 ? "" : DIGIT[thousands]) + "천";
  if (hundreds) s += (hundreds === 1 ? "" : DIGIT[hundreds]) + "백";
  if (tens) s += (tens === 1 ? "" : DIGIT[tens]) + "십";
  if (ones) s += DIGIT[ones];
  return s;
}

// Accepted readings of n, standard form first. Numbers are grouped by 만 (10,000) and 억 (100,000,000).
// 10,000 is "만" (일만 also accepted). 100,000,000 is "일억" (억 also accepted).
export function sinoForms(n) {
  if (!Number.isInteger(n) || n < 0 || n >= 1e12) throw new RangeError("Supported range is 0 to 999,999,999,999");
  if (n === 0) return ["영", "공"];
  const eok = Math.floor(n / 1e8);
  const man = Math.floor((n % 1e8) / 1e4);
  const rest = n % 1e4;
  const build = (keepManOne, keepEokOne) => {
    const parts = [];
    if (eok) parts.push((eok === 1 && !keepEokOne ? "" : under10000(eok)) + "억");
    if (man) parts.push((man === 1 && !keepManOne ? "" : under10000(man)) + "만");
    if (rest) parts.push(under10000(rest));
    return parts.join(" ");
  };
  const forms = [build(false, true)];
  if (man === 1) forms.push(build(true, true));
  if (eok === 1) forms.push(build(false, false));
  if (man === 1 && eok === 1) forms.push(build(true, false));
  return forms.filter((f, i) => forms.indexOf(f) === i);
}

export const sino = (n) => sinoForms(n)[0];

/* ---------- helpers ---------- */

const ri = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const fmt = (n) => n.toLocaleString("en-US");
const withUnit = (forms, unit) => forms.map((f) => `${f} ${unit}`);

function make(display, forms, nums, extra = {}) {
  return { id: display, display, ko: forms[0], alts: forms.slice(1), nums, placeholder: "e.g. 35000", ...extra };
}

/* ---------- categories ---------- */

const MONTHS = ["", "일월", "이월", "삼월", "사월", "오월", "유월", "칠월", "팔월", "구월", "시월", "십일월", "십이월"];
const MONTH_DAYS = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NOTE = "June (6월) is 유월 and October (10월) is 시월, not 육월 or 십월.";
const HOURS = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두"];

const UNITS = [
  { show: (n) => `${n}층`, unit: "층", alts: [], range: [1, 30] },
  { show: (n) => `${n}번`, unit: "번", alts: [], range: [1, 999] },
  { show: (n) => `${n}%`, unit: "퍼센트", alts: ["프로"], range: [1, 100] },
  { show: (n) => `${n}개월`, unit: "개월", alts: [], range: [1, 24] },
  { show: (n) => `${n}학년`, unit: "학년", alts: [], range: [1, 6] },
  { show: (n) => `${n}분`, unit: "분", alts: [], range: [1, 59] },
  { show: (n) => `${n}kg`, unit: "킬로그램", alts: ["킬로"], range: [30, 120] },
  { show: (n) => `${n}cm`, unit: "센티미터", alts: ["센티"], range: [140, 190] },
];

function moneyItem(v) {
  return make(`${fmt(v)}원`, withUnit(sinoForms(v), "원"), [v]);
}

const CATEGORIES = {
  digits: {
    id: "digits",
    label: "Digits 0 – 10",
    why: "The building blocks for everything else. Practise until 일 이 삼 사 오 육 칠 팔 구 십 are instant.",
    size: 11,
    make: () => {
      const n = ri(0, 10);
      return make(String(n), sinoForms(n), [n], { placeholder: "e.g. 7" });
    },
  },
  tens: {
    id: "tens",
    label: "11 – 99",
    why: "Minutes, percentages, bus lines, ages in formal speech. Tens and ones just join up: 이십 + 칠 = 이십칠.",
    size: 89,
    make: () => {
      const n = ri(11, 99);
      return make(String(n), sinoForms(n), [n], { placeholder: "e.g. 27" });
    },
  },
  hundreds: {
    id: "hundreds",
    label: "100 – 999",
    why: "Room and bus numbers, calories, small prices. The 일 is dropped before 백: 100 is 백, not 일백.",
    size: 900,
    make: () => {
      const n = Math.random() < 0.35 ? ri(2, 19) * 50 : ri(100, 999);
      return make(String(n), sinoForms(n), [n], { placeholder: "e.g. 350" });
    },
  },
  prices: {
    id: "prices",
    label: "Prices under 10,000원",
    why: "Coffee, snacks, bus fares and shop tags: 1,500원, 3,500원, 9,900원.",
    size: 150,
    make: () => {
      const v = Math.random() < 0.6 ? ri(1, 99) * 100 : ri(1, 19) * 500;
      return moneyItem(v);
    },
  },
  money: {
    id: "money",
    label: "Money: 만 원 and up",
    why: "Meals, rent, salaries. Koreans count money in 만 (10,000): 35,000원 is 삼만 오천 원, 1,500,000원 is 백오십만 원.",
    size: 400,
    make: () => {
      const r = Math.random();
      if (r < 0.4) return moneyItem(ri(20, 198) * 500); // 10,000 - 99,000
      if (r < 0.7) return moneyItem(ri(10, 99) * 10000); // 100,000 - 990,000
      return moneyItem(Math.random() < 0.5 ? ri(1, 9) * 1e6 : ri(10, 99) * 1e6); // millions
    },
  },
  years: {
    id: "years",
    label: "Years",
    why: "Birth years, history, deadlines: 1995년 천구백구십오 년, 2026년 이천이십육 년.",
    size: 140,
    make: () => {
      const y = Math.random() < 0.8 ? ri(1960, 2035) : ri(1900, 1959);
      return make(`${y}년`, withUnit(sinoForms(y), "년"), [y], { placeholder: "e.g. 1995" });
    },
  },
  dates: {
    id: "dates",
    label: "Dates: months and days",
    why: "Months and days use Sino-Korean numbers with 월 and 일. Watch the irregular 유월 (June) and 시월 (October).",
    size: 400,
    make: () => {
      const r = Math.random();
      const month = ri(1, 12);
      const note = month === 6 || month === 10 ? MONTH_NOTE : "";
      if (r < 0.3) return make(`${month}월`, [MONTHS[month]], [month], { note, placeholder: "e.g. 6" });
      if (r < 0.5) {
        const d = ri(1, 31);
        return make(`${d}일`, sinoForms(d).map((f) => `${f}일`), [d], { placeholder: "e.g. 15" });
      }
      const d = ri(1, MONTH_DAYS[month]);
      return make(`${month}월 ${d}일`, [`${MONTHS[month]} ${sino(d)}일`], [month, d], { note, placeholder: "e.g. 6/15" });
    },
  },
  time: {
    id: "time",
    label: "Clock time",
    why: "Telling time mixes both systems: hours are pure Korean (세 시), minutes are Sino-Korean (십오 분).",
    size: 400,
    make: () => {
      const hour = ri(1, 12);
      const r = Math.random();
      const minute = r < 0.15 ? 0 : r < 0.7 ? ri(1, 11) * 5 : ri(1, 59);
      const display = `${hour}:${String(minute).padStart(2, "0")}`;
      const h = `${HOURS[hour]} 시`;
      const note = "Hours use pure Korean numbers. Minutes use Sino-Korean numbers.";
      if (minute === 0) return make(display, [h, `${h} 정각`], [hour, 0], { numsAlts: [[hour]], note, placeholder: "e.g. 3:15" });
      const forms = [`${h} ${sino(minute)} 분`];
      if (minute === 30) forms.push(`${h} 반`);
      return make(display, forms, [hour, minute], { note, placeholder: "e.g. 3:15" });
    },
  },
  phone: {
    id: "phone",
    label: "Phone numbers",
    why: "Phone numbers are read digit by digit, with 0 as 공: 010 is 공일공.",
    size: 1000,
    make: () => {
      const digits = (n) => Array.from({ length: n }, () => ri(0, 9)).join("");
      const groups = Math.random() < 0.85 ? ["010", digits(4), digits(4)] : ["02", digits(ri(3, 4)), digits(4)];
      const display = groups.join("-");
      const read = (zero) => groups.map((g) => [...g].map((c) => (c === "0" ? zero : PHONE_DIGIT[Number(c)])).join("")).join(" ");
      return make(display, [read("공"), read("영")], [], {
        digits: groups.join(""),
        note: "Phone numbers are read one digit at a time, with 0 as 공.",
        placeholder: "e.g. 010-1234-5678",
      });
    },
  },
  units: {
    id: "units",
    label: "Everyday units",
    why: "Floors, bus numbers, percentages, months of time, school years, minutes, weight and height all take Sino-Korean numbers.",
    size: 1000,
    make: () => {
      const u = pick(UNITS);
      const n = ri(u.range[0], u.range[1]);
      const forms = sinoForms(n).flatMap((f) => [u.unit, ...u.alts].map((unit) => `${f} ${unit}`));
      return make(u.show(n), forms, [n], { placeholder: "e.g. 15" });
    },
  },
  big: {
    id: "big",
    label: "Big numbers: 만 and 억",
    why: "Populations, big prices and salaries. Count in 만 (10,000) and 억 (100 million): 340,000,000 is 삼억 사천만.",
    size: 1000,
    make: () => {
      const r = Math.random();
      const v = r < 0.35 ? ri(1, 999) * 10000 : r < 0.65 ? ri(10, 99) * 1e6 : ri(10, 990) * 1e7 + (Math.random() < 0.3 ? ri(1, 9) * 1e8 : 0);
      return make(fmt(v), sinoForms(v), [v]);
    },
  },
};

const MIX_FROM = ["tens", "hundreds", "prices", "money", "years", "dates", "time", "phone", "units", "big"];
CATEGORIES.mix = {
  id: "mix",
  label: "Mixed review",
  why: "A random mix of everything above. Good once the individual categories feel comfortable.",
  size: 1000,
  make: () => CATEGORIES[pick(MIX_FROM)].make(),
};

export const SINO_GROUPS = [
  { label: "Foundations", ids: ["digits", "tens", "hundreds"] },
  { label: "Everyday life", ids: ["prices", "money", "years", "dates", "time", "phone", "units"] },
  { label: "Large numbers", ids: ["big"] },
  { label: "Review", ids: ["mix"] },
].map((g) => ({ label: g.label, categories: g.ids.map((id) => CATEGORIES[id]) }));

export const SINO_CATEGORIES = Object.values(CATEGORIES);
export const sinoCategory = (id) => CATEGORIES[id] || CATEGORIES.digits;

// Up to `count` different random items from a category.
export function generateItems(category, count) {
  const seen = new Set();
  const out = [];
  for (let i = 0; i < count * 40 && out.length < count; i++) {
    const item = category.make();
    if (seen.has(item.display)) continue;
    seen.add(item.display);
    out.push(item);
  }
  return out;
}

export const SINO_DIRECTIONS = [
  { id: "ko-num", label: "Korean → number", hint: "See the Korean, type the number" },
  { id: "num-ko", label: "Number → Korean", hint: "See the number, type the Korean" },
];

// Reference for the chart on the Sino-Korean tab.
export const SINO_REFERENCE = {
  digits: Array.from({ length: 11 }, (_, n) => ({ n, ko: n === 0 ? "영 / 공" : sino(n) })),
  places: [
    { n: "10", ko: "십" },
    { n: "100", ko: "백" },
    { n: "1,000", ko: "천" },
    { n: "10,000", ko: "만" },
    { n: "100,000,000", ko: "억" },
  ],
};
