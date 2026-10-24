import test from "node:test";
import assert from "node:assert/strict";
import {
  isCode,
  validateResults,
  validatePattern,
  calculateNet,
  weekDays,
} from "../src/validation/index";
import { homeworkService } from "../src/services/homeworkService";
import { noteService } from "../src/services/noteService";
import { studentService } from "../src/services/studentService";
import { teacherService } from "../src/services/teacherService";
import { wrongNotebookService } from "../src/services/wrongNotebookService";
import { goalService } from "../src/services/goalService";
import { mockExamService } from "../src/services/mockExamService";
import { messageService } from "../src/services/messageService";
import { subjectService } from "../src/services/subjectService";
import { weeklyPlanService } from "../src/services/weeklyPlanService";
import { ApiError } from "../src/services/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
test("Altı rakam zorunlu; kısmi, harfli veya boş giriş kabul edilmez", () => {
  assert.equal(isCode(""), false);
  assert.equal(isCode("1".repeat(5)), false);
  assert.equal(isCode("1".repeat(6)), true);
  assert.equal(isCode("a".repeat(6)), false);
});
test("Tamamlama toplamı ödevin tamamını karşılar", () => {
  assert.equal(validateResults(20, 0, [], 20), null);
  assert.notEqual(validateResults(19, 0, [], 20), null);
  assert.notEqual(validateResults(-1, 0, [], 20), null);
  assert.notEqual(validateResults(0.5, 0, []), null);
});
test("Yanlış varsa boş konu veya tutarsız dağılım engellenir", () => {
  assert.notEqual(validateResults(15, 5, [], 20), null);
  assert.notEqual(validateResults(15, 5, [{ topic: " ", count: 5 }], 20), null);
  assert.notEqual(
    validateResults(15, 5, [{ topic: String.fromCharCode(65), count: 4 }], 20),
    null,
  );
  assert.equal(
    validateResults(15, 5, [{ topic: String.fromCharCode(65), count: 5 }], 20),
    null,
  );
});
test("Tekrarlama ve dönüşüm için geçerli seçim gerekir", () => {
  assert.notEqual(
    validatePattern({ type: "weekdays", startDate: "", days: [] }),
    null,
  );
  assert.notEqual(
    validatePattern({ type: "alternating", startDate: "", subjectIds: [] }),
    null,
  );
  assert.notEqual(
    validatePattern({
      type: "alternating",
      startDate: "",
      subjectIds: ["", ""],
    }),
    null,
  );
});
test("Net kuralı yapılandırılabilir", () => {
  assert.equal(calculateNet(20, 4, 4), 19);
  assert.equal(calculateNet(20, 3, 3), 19);
  assert.equal(calculateNet(0, 4, 4), -1);
});
test("Haftalık plan Pazartesi başlar, Pazar biter", () => {
  const w = weekDays();
  assert.equal(w.length, 7);
  assert.equal(new Date(w[0] + "T12:00:00").getDay(), 1);
  assert.equal(new Date(w[6] + "T12:00:00").getDay(), 0);
});
test("Bağlantısız servisler tüm listeleri boş, profilleri null döndürür", async () => {
  const lists = await Promise.all([
    homeworkService.list(),
    noteService.list(),
    teacherService.listStudents(),
    wrongNotebookService.list("current"),
    wrongNotebookService.list("history"),
    goalService.list(),
    goalService.listResults(),
    mockExamService.list(),
    messageService.listReceived(),
    subjectService.list(),
    subjectService.listSelected(),
    weeklyPlanService.list(""),
  ]);
  for (const list of lists) assert.deepEqual(list, []);
  assert.equal(await studentService.getProfile(), null);
  assert.equal(await teacherService.getProfile(), null);
  assert.deepEqual(await studentService.getDailySummary(""), {
    totalQuestions: 0,
    correct: 0,
    wrong: 0,
    target: 0,
    completedHomework: 0,
  });
});
test("Bağlantısız yazma işlemi başarılıymış gibi davranmaz", async () => {
  await assert.rejects(
    () => teacherService.linkStudent(""),
    (e: unknown) => e instanceof ApiError && e.code === "UNAVAILABLE",
  );
});
test("Öğretmen görünümü özel not servisini içe aktarmaz", () => {
  const src = readFileSync("src/pages/TeacherPages.tsx", "utf8");
  assert.ok(!src.includes("noteService"));
  assert.ok(!src.includes("PrivateNote"));
  assert.ok(
    !readFileSync("src/services/teacherService.ts", "utf8").includes(
      "private-notes",
    ),
  );
});
test("İstemci kaynaklarında kalıcı cihaz depolaması yok", () => {
  const walk = (p: string): string[] =>
    readdirSync(p).flatMap((n) =>
      statSync(join(p, n)).isDirectory() ? walk(join(p, n)) : [join(p, n)],
    );
  for (const path of walk("src"))
    assert.doesNotMatch(
      readFileSync(path, "utf8"),
      /localStorage|sessionStorage|indexedDB/,
    );
});
