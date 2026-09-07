import { QUIZ_DATABASE, QuizQuestion, Difficulty } from "@/data/quizData";

export const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const CATEGORY_LABELS: Record<string, string> = {
  Optics: "光学",
  Sensor: "传感器",
  Exposure: "曝光",
  Video: "视频工程",
  Format: "编码格式",
  Formats: "编码格式",
  Lighting: "布光",
  Audio: "录音",
  Post: "调色后期",
  Mech: "机械系统",
  Mechanics: "机械系统",
  Misc: "综合",
  Industry: "行业",
  Monitor: "监看",
  Lens: "镜头",
  Color: "色彩",
  Signal: "信号链",
  Timecode: "时码",
  Data: "存储备份",
  Physics: "物理基础",
  Camera: "机身操作",
  Sony: "索尼生态",
};

export const TYPE_LABELS: Record<string, string> = {
  SINGLE: "单选",
  MULTI: "多选",
  TRUE_FALSE: "判断",
  ORDER: "排序",
  MATCHING: "连线",
  INTERACTIVE: "交互",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "基础",
  MEDIUM: "进阶",
  HARD: "硬核",
};

export const DIFFICULTY_COLORS: Record<Difficulty, { text: string; badge: string; bar: string }> = {
  EASY: { text: "text-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300", bar: "bg-emerald-400" },
  MEDIUM: { text: "text-sky-400", badge: "bg-sky-400/10 border-sky-400/30 text-sky-300", bar: "bg-sky-400" },
  HARD: { text: "text-red-400", badge: "bg-red-400/10 border-red-400/30 text-red-300", bar: "bg-red-400" },
};

export const categoryLabel = (cat: string): string => CATEGORY_LABELS[cat] ?? cat;

export const countByDifficulty = (pool: QuizQuestion[]) => ({
  EASY: pool.filter((q) => q.difficulty === "EASY").length,
  MEDIUM: pool.filter((q) => q.difficulty === "MEDIUM").length,
  HARD: pool.filter((q) => q.difficulty === "HARD").length,
});

export const countByType = (pool: QuizQuestion[]) => {
  const map = new Map<string, number>();
  pool.forEach((q) => map.set(q.type, (map.get(q.type) ?? 0) + 1));
  return map;
};

export const countByCategory = (pool: QuizQuestion[]) => {
  const map = new Map<string, number>();
  pool.forEach((q) => map.set(q.category, (map.get(q.category) ?? 0) + 1));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

export const selectQuestions = (count: number, dist: { easy: number; medium: number; hard: number }): QuizQuestion[] => {
  const totalDist = dist.easy + dist.medium + dist.hard || 1;
  const normEasy = dist.easy / totalDist;
  const normMed = dist.medium / totalDist;

  let targetEasy = Math.round(count * normEasy);
  let targetMed = Math.round(count * normMed);
  let targetHard = count - targetEasy - targetMed;

  const easyPool = shuffle(QUIZ_DATABASE.filter((q) => q.difficulty === "EASY"));
  const medPool = shuffle(QUIZ_DATABASE.filter((q) => q.difficulty === "MEDIUM"));
  const hardPool = shuffle(QUIZ_DATABASE.filter((q) => q.difficulty === "HARD"));

  let selected: QuizQuestion[] = [];
  const take = (pool: QuizQuestion[], amount: number): number => {
    const taken = pool.slice(0, amount);
    selected = [...selected, ...taken];
    return Math.max(0, amount - taken.length);
  };

  let missing = take(hardPool, targetHard);
  targetMed += missing;
  missing = take(medPool, targetMed);
  targetEasy += missing;
  missing = take(easyPool, targetEasy);

  if (missing > 0) {
    const remainingAll = shuffle(QUIZ_DATABASE.filter((q) => !selected.includes(q)));
    selected = [...selected, ...remainingAll.slice(0, missing)];
  }

  return shuffle(selected).slice(0, count);
};

export const generateCsv = (pool: QuizQuestion[]): string => {
  const headers = ["ID", "Category", "Type", "Difficulty", "Question", "Options", "Correct Answer", "Explanation"];
  const rows = pool.map((q) => {
    const safe = (txt: string) => `"${txt.replace(/"/g, '""')}"`;
    const opts = q.options.join(" | ");
    const ans = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(" | ") : q.correctAnswer;
    return [q.id, q.category, q.type, q.difficulty, safe(q.question), safe(opts), safe(ans), safe(q.explanation)].join(",");
  });
  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
};

export const downloadCsv = (pool: QuizQuestion[]) => {
  const blob = new Blob([generateCsv(pool)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "cinetech_quiz_database.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const BEST_KEY = "cinetech-quiz-best";

export const loadBestScore = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BEST_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : null;
};

export const saveBestScore = (score: number) => {
  if (typeof window === "undefined") return;
  const prev = loadBestScore();
  if (prev === null || score > prev) {
    window.localStorage.setItem(BEST_KEY, String(score));
  }
};
