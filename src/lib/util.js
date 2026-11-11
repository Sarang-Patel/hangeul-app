export const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const plural = (n) => `${n} ${n === 1 ? "card" : "cards"}`;
