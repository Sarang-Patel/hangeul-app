// Answer matching for typed practice.

// Normalises text for comparison: case, spacing, trailing punctuation, "(notes)" and a leading article.
export function key(s) {
  let k = String(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[.!?¿¡~…"“”'’]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  k = k.replace(/^(to|a|an|the) /, "");
  if (/[가-힣]/.test(k)) k = k.replace(/\s/g, "");
  return k;
}

// "rice / meal" is accepted as "rice / meal", "rice" or "meal".
export function accepted(text) {
  const out = [key(text)];
  String(text)
    .split(/[\/;,]/)
    .forEach((part) => out.push(key(part)));
  return out.filter((x, i) => x && out.indexOf(x) === i);
}

export function checkAnswer(expected, input) {
  const typed = key(input);
  return !!typed && accepted(expected).includes(typed);
}
