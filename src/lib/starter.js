import { uid } from "./util.js";

// Example cards shown the first time the app opens with an empty database.
export function makeStarter() {
  const c = (ko, en, g) => ({ id: uid(), ko, en, g });
  return {
    starter: true,
    groups: [
      { id: "g_greet", name: "Greetings" },
      { id: "g_food", name: "Food" },
    ],
    cards: [
      c("안녕하세요", "hello", "g_greet"),
      c("감사합니다", "thank you", "g_greet"),
      c("죄송합니다", "sorry", "g_greet"),
      c("네", "yes", "g_greet"),
      c("아니요", "no", "g_greet"),
      c("안녕히 가세요", "goodbye", "g_greet"),
      c("처음 뵙겠습니다", "nice to meet you", "g_greet"),
      c("물", "water", "g_food"),
      c("밥", "rice / meal", "g_food"),
      c("김치", "kimchi", "g_food"),
      c("커피", "coffee", "g_food"),
      c("맛있어요", "delicious", "g_food"),
    ],
  };
}
