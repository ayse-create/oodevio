import type { WrongTopic, GoalPattern, DateOnly } from "../models";
export const isCode = (value: string) => /^\d{6}$/.test(value);
export const isWhole = (value: number) => Number.isInteger(value) && value >= 0;
export const calculateNet = (correct: number, wrong: number, penalty: number) =>
  Number((correct - wrong / penalty).toFixed(2));
export function validateResults(
  correct: number,
  wrong: number,
  topics: WrongTopic[],
  total?: number,
): string | null {
  if (!isWhole(correct) || !isWhole(wrong))
    return "Doğru ve yanlış sayıları sıfır veya pozitif tam sayı olmalı.";
  if (total !== undefined && correct + wrong !== total)
    return `Doğru ve yanlış toplamı ${total} soru olmalı.`;
  if (wrong > 0) {
    if (
      !topics.length ||
      topics.some((t) => !t.topic.trim() || !isWhole(t.count) || t.count < 1)
    )
      return "Her yanlış konusu için konu adı ve en az bir yanlış gir.";
    if (topics.reduce((s, t) => s + t.count, 0) !== wrong)
      return "Konulardaki yanlış sayılarının toplamı, yanlış sayısına eşit olmalı.";
  }
  return null;
}
export function validatePattern(pattern: GoalPattern): string | null {
  if (pattern.type === "weekdays" && !pattern.days.length)
    return "En az bir gün seç.";
  if (
    pattern.type === "alternating" &&
    (pattern.subjectIds.length < 2 ||
      new Set(pattern.subjectIds).size !== pattern.subjectIds.length)
  )
    return "Dönüşümlü hedef için en az iki farklı ders seç.";
  return null;
}
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const dateLabel = (date: string) =>
  new Date(`${date.slice(0, 10)}T12:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
export function weekDays(offset = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const n = new Date(d);
    n.setDate(d.getDate() + i);
    return localDate(n);
  });
}
/** Schedule projection only. The API remains authoritative for saved daily totals. */
export function goalSubjectOnDate(
  goal: import("../models").DailyGoal,
  date: DateOnly,
): string | null {
  if (!goal.active) return null;
  const p = goal.pattern;
  if (p.type === "once") return p.date === date ? goal.subjectId : null;
  if (date < p.startDate) return null;
  if (p.type === "daily") return goal.subjectId;
  if (p.type === "weekdays")
    return p.days.includes(
      ((new Date(date + "T12:00:00").getDay() + 6) % 7) + 1,
    )
      ? goal.subjectId
      : null;
  const diff = Math.round(
    (Date.parse(date + "T00:00:00Z") - Date.parse(p.startDate + "T00:00:00Z")) /
      86400000,
  );
  return p.subjectIds.length ? p.subjectIds[diff % p.subjectIds.length] : null;
}
