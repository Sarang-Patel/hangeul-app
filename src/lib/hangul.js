// Hangul data for the Alphabet tab: letters, generated syllables, and a short word list.
// Romanization follows the Revised Romanization of Korean, as for isolated syllables.
//
// Every item has the same shape:
//   { id, text, roman, kind, parts, note }
//   kind: "consonant" | "vowel" | "syllable" | "word"
//   parts: used to find look-alike wrong options (initial/vowel/final, or the word's syllables)

/* ---------- letters ---------- */

const letter = (ch, roman, kind, group, hint) => ({ id: `l_${ch}`, text: ch, roman, kind, parts: [], group, note: hint });

export const CONSONANTS = [
  letter("ㄱ", "g / k", "consonant", "basic", "Like g in go at the start of a syllable, and k at the end."),
  letter("ㄴ", "n", "consonant", "basic", "Like n in no."),
  letter("ㄷ", "d / t", "consonant", "basic", "Like d in do at the start, and t at the end."),
  letter("ㄹ", "r / l", "consonant", "basic", "A light r between vowels, and l at the end of a syllable."),
  letter("ㅁ", "m", "consonant", "basic", "Like m in mom."),
  letter("ㅂ", "b / p", "consonant", "basic", "Like b in boy at the start, and p at the end."),
  letter("ㅅ", "s", "consonant", "basic", "Like s in sun."),
  letter("ㅇ", "silent / ng", "consonant", "basic", "Silent at the start of a syllable. Like ng in sing at the end."),
  letter("ㅈ", "j", "consonant", "basic", "Like j in jam."),
  letter("ㅊ", "ch", "consonant", "basic", "Like ch in chat, with a puff of air."),
  letter("ㅋ", "k", "consonant", "basic", "Like k, with a strong puff of air."),
  letter("ㅌ", "t", "consonant", "basic", "Like t, with a strong puff of air."),
  letter("ㅍ", "p", "consonant", "basic", "Like p, with a strong puff of air."),
  letter("ㅎ", "h", "consonant", "basic", "Like h in hi."),
  letter("ㄲ", "kk", "consonant", "double", "A tight, tense k with no puff of air."),
  letter("ㄸ", "tt", "consonant", "double", "A tight, tense t with no puff of air."),
  letter("ㅃ", "pp", "consonant", "double", "A tight, tense p with no puff of air."),
  letter("ㅆ", "ss", "consonant", "double", "A tight, tense s."),
  letter("ㅉ", "jj", "consonant", "double", "A tight, tense j."),
];

export const VOWELS = [
  letter("ㅏ", "a", "vowel", "basic", "Like a in father."),
  letter("ㅑ", "ya", "vowel", "basic", "Like ya in yacht."),
  letter("ㅓ", "eo", "vowel", "basic", "Like u in cup, with a relaxed open mouth."),
  letter("ㅕ", "yeo", "vowel", "basic", "Like yu in yup."),
  letter("ㅗ", "o", "vowel", "basic", "Like o in go, with rounded lips."),
  letter("ㅛ", "yo", "vowel", "basic", "Like yo in yoga."),
  letter("ㅜ", "u", "vowel", "basic", "Like oo in moon."),
  letter("ㅠ", "yu", "vowel", "basic", "Like you."),
  letter("ㅡ", "eu", "vowel", "basic", "Like oo in book, with the lips spread flat."),
  letter("ㅣ", "i", "vowel", "basic", "Like ee in see."),
  letter("ㅐ", "ae", "vowel", "compound", "Like e in bed. Today it sounds almost the same as ㅔ."),
  letter("ㅒ", "yae", "vowel", "compound", "Like ye in yes, a little more open."),
  letter("ㅔ", "e", "vowel", "compound", "Like e in bed. Today it sounds almost the same as ㅐ."),
  letter("ㅖ", "ye", "vowel", "compound", "Like ye in yes."),
  letter("ㅘ", "wa", "vowel", "compound", "ㅗ + ㅏ, like wa in wand."),
  letter("ㅙ", "wae", "vowel", "compound", "ㅗ + ㅐ, like we in wet."),
  letter("ㅚ", "oe", "vowel", "compound", "Sounds like we in wet."),
  letter("ㅝ", "wo", "vowel", "compound", "ㅜ + ㅓ, like wo in won."),
  letter("ㅞ", "we", "vowel", "compound", "ㅜ + ㅔ, like we in wet."),
  letter("ㅟ", "wi", "vowel", "compound", "Like wee."),
  letter("ㅢ", "ui", "vowel", "compound", "ㅡ + ㅣ, said as one sound."),
];

/* ---------- syllables ---------- */

const INITIALS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
const VOWEL_ORDER = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
const FINALS = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const compose = (initial, vowel, final = "") =>
  String.fromCharCode(0xac00 + (INITIALS.indexOf(initial) * 21 + VOWEL_ORDER.indexOf(vowel)) * 28 + FINALS.indexOf(final));

const INITIAL_ROMAN = { ㄱ: "g", ㄴ: "n", ㄷ: "d", ㄹ: "r", ㅁ: "m", ㅂ: "b", ㅅ: "s", ㅇ: "", ㅈ: "j", ㅊ: "ch", ㅋ: "k", ㅌ: "t", ㅍ: "p", ㅎ: "h" };
const FINAL_ROMAN = { ㄱ: "k", ㄴ: "n", ㄷ: "t", ㄹ: "l", ㅁ: "m", ㅂ: "p", ㅇ: "ng" };

const SYLLABLE_INITIALS = Object.keys(INITIAL_ROMAN);
const SYLLABLE_VOWELS = VOWELS.filter((v) => v.group === "basic");
const SYLLABLE_FINALS = Object.keys(FINAL_ROMAN);
const Y_VOWELS = "ㅑㅕㅛㅠ";

function syllable(initial, vowel, final = "") {
  const v = SYLLABLE_VOWELS.find((x) => x.text === vowel);
  const text = compose(initial, vowel, final);
  const sounds = [initial === "ㅇ" ? "ㅇ (silent)" : initial, vowel, final].filter(Boolean);
  return {
    id: `s_${text}`,
    text,
    roman: INITIAL_ROMAN[initial] + v.roman + (final ? FINAL_ROMAN[final] : ""),
    kind: "syllable",
    parts: [initial, vowel, final],
    note: `${sounds.join(" + ")} → ${text}`,
  };
}

function buildSyllables(withFinal) {
  const out = [];
  SYLLABLE_INITIALS.forEach((i) => {
    SYLLABLE_VOWELS.forEach((v) => {
      // ㅈ and ㅊ already sound like y + vowel, so 져 and 저 would be the same sound
      if ((i === "ㅈ" || i === "ㅊ") && Y_VOWELS.includes(v.text)) return;
      if (!withFinal) out.push(syllable(i, v.text));
      else SYLLABLE_FINALS.forEach((f) => out.push(syllable(i, v.text, f)));
    });
  });
  return out;
}

/* ---------- words ---------- */

const WORD_LIST = [
  ["가방", "gabang", "bag"], ["나라", "nara", "country"], ["나무", "namu", "tree"], ["바다", "bada", "sea"],
  ["하늘", "haneul", "sky"], ["하나", "hana", "one"], ["고기", "gogi", "meat"], ["사람", "saram", "person"],
  ["사랑", "sarang", "love"], ["친구", "chingu", "friend"], ["가족", "gajok", "family"], ["학교", "hakgyo", "school"],
  ["학생", "haksaeng", "student"], ["선생님", "seonsaengnim", "teacher"], ["한국", "hanguk", "Korea"], ["물", "mul", "water"],
  ["밥", "bap", "rice, meal"], ["집", "jip", "house"], ["책", "chaek", "book"], ["우유", "uyu", "milk"],
  ["아이", "ai", "child"], ["아기", "agi", "baby"], ["어머니", "eomeoni", "mother"], ["아버지", "abeoji", "father"],
  ["김치", "gimchi", "kimchi"], ["커피", "keopi", "coffee"], ["사과", "sagwa", "apple"], ["의자", "uija", "chair"],
  ["주스", "juseu", "juice"], ["모자", "moja", "hat"], ["고양이", "goyangi", "cat"], ["강아지", "gangaji", "puppy"],
  ["포도", "podo", "grapes"], ["토마토", "tomato", "tomato"], ["라디오", "radio", "radio"], ["치즈", "chijeu", "cheese"],
  ["빵", "ppang", "bread"], ["산", "san", "mountain"], ["강", "gang", "river"], ["길", "gil", "road"],
  ["별", "byeol", "star"], ["달", "dal", "moon"], ["해", "hae", "sun"], ["비", "bi", "rain"],
  ["꽃", "kkot", "flower"], ["밤", "bam", "night"], ["손", "son", "hand"], ["발", "bal", "foot"],
  ["입", "ip", "mouth"], ["코", "ko", "nose"], ["귀", "gwi", "ear"], ["머리", "meori", "head"],
  ["얼굴", "eolgul", "face"], ["이름", "ireum", "name"], ["오리", "ori", "duck"], ["구두", "gudu", "shoes"],
  ["가수", "gasu", "singer"], ["바지", "baji", "pants"], ["우산", "usan", "umbrella"], ["시계", "sigye", "clock"],
  ["의사", "uisa", "doctor"], ["여자", "yeoja", "woman"], ["남자", "namja", "man"], ["음식", "eumsik", "food"],
  ["공부", "gongbu", "study"], ["영화", "yeonghwa", "movie"], ["노래", "norae", "song"], ["거울", "geoul", "mirror"],
  ["토끼", "tokki", "rabbit"], ["사자", "saja", "lion"], ["호랑이", "horangi", "tiger"], ["두부", "dubu", "tofu"],
  ["라면", "ramyeon", "ramen"],
].map(([text, roman, meaning]) => ({
  id: `w_${text}`,
  text,
  roman,
  kind: "word",
  parts: [...text],
  note: `Meaning: ${meaning}`,
}));

/* ---------- levels and sets ---------- */

const memo = (fn) => {
  let cache;
  return () => (cache ||= fn());
};
const syllablesOpen = memo(() => buildSyllables(false));
const syllablesClosed = memo(() => buildSyllables(true));

export const LEVELS = [
  {
    id: "letters",
    label: "Letters",
    hint: "Single consonants and vowels: ㄱ ㄴ ㅏ ㅓ",
    sets: [
      { id: "basic", label: "Basic consonants and vowels", items: () => [...CONSONANTS, ...VOWELS].filter((l) => l.group === "basic") },
      { id: "consonants", label: "Basic consonants only", items: () => CONSONANTS.filter((l) => l.group === "basic") },
      { id: "vowels", label: "Basic vowels only", items: () => VOWELS.filter((l) => l.group === "basic") },
      { id: "all", label: "Everything, with double consonants and compound vowels", items: () => [...CONSONANTS, ...VOWELS] },
    ],
  },
  {
    id: "syllables",
    label: "Syllables",
    hint: "Consonant + vowel blocks: 가 나 거, then 각 난",
    sets: [
      { id: "open", label: "Consonant + vowel (가, 나, 거)", items: syllablesOpen },
      { id: "closed", label: "With a final consonant (각, 난, 길)", items: syllablesClosed },
      { id: "both", label: "Both", items: () => [...syllablesOpen(), ...syllablesClosed()] },
    ],
  },
  {
    id: "words",
    label: "Words",
    hint: "Short real words built from those syllables",
    sets: [{ id: "all", label: "Everyday words", items: () => WORD_LIST }],
  },
];

export const levelOf = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];
export const setOf = (level, id) => level.sets.find((s) => s.id === id) || level.sets[0];

// Compact reference for the chart on the Alphabet tab.
export const CHART = { consonants: CONSONANTS, vowels: VOWELS };
