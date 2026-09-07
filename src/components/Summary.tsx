"use client";

import React, { useMemo, useState } from "react";
import { RefreshCw, Trophy, BarChart2, ChevronDown, Home, Target } from "lucide-react";
import { QuizQuestion } from "@/data/quizData";
import { AnswerRecord } from "@/types";
import { DIFFICULTY_COLORS, categoryLabel } from "@/utils/quiz";

interface Props {
  questions: QuizQuestion[];
  records: AnswerRecord[];
  score: number;
  bestScore: number | null;
  onRestart: () => void;
  onHome: () => void;
}

const getRank = (p: number) => {
  if (p === 100) return { title: "光影宗师", desc: "无懈可击！您就是行走的影视技术百科全书。", color: "text-glow-300" };
  if (p >= 90) return { title: "资深专家", desc: "极其扎实的理论功底，距离封神仅一步之遥。", color: "text-glow-300" };
  if (p >= 80) return { title: "职业摄影师", desc: "非常专业，这些知识对您来说已经是肌肉记忆。", color: "text-glow-300" };
  if (p >= 60) return { title: "摄影发烧友", desc: "基础不错！继续积累经验，进阶指日可待。", color: "text-emerald-300" };
  if (p >= 40) return { title: "入门学徒", desc: "还在学习路上。建议多复习基础光学和曝光原理。", color: "text-sky-300" };
  return { title: "摄影萌新", desc: "万丈高楼平地起，建议先从核心概念学起。", color: "text-ink-400" };
};

export const Summary: React.FC<Props> = ({ questions, records, score, bestScore, onRestart, onHome }) => {
  const maxScore = questions.length * 10;
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const rank = getRank(percentage);
  const [openReview, setOpenReview] = useState<number | null>(null);

  const stats = useMemo(() => {
    const data = {
      EASY: { total: 0, correct: 0 },
      MEDIUM: { total: 0, correct: 0 },
      HARD: { total: 0, correct: 0 },
    };
    questions.forEach((q, i) => {
      const diff = q.difficulty;
      data[diff].total++;
      if (records[i]?.status === "CORRECT") data[diff].correct++;
    });
    return data;
  }, [questions, records]);

  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; correct: number }>();
    questions.forEach((q, i) => {
      const entry = map.get(q.category) ?? { total: 0, correct: 0 };
      entry.total++;
      if (records[i]?.status === "CORRECT") entry.correct++;
      map.set(q.category, entry);
    });
    return [...map.entries()]
      .map(([cat, s]) => ({ cat, ...s, rate: Math.round((s.correct / s.total) * 100) }))
      .filter((s) => s.total >= 2)
      .sort((a, b) => a.rate - b.rate);
  }, [questions, records]);

  const weakSpots = categoryStats.filter((s) => s.rate < 60).slice(0, 3);
  const correctCount = records.filter((r) => r.status === "CORRECT").length;
  const R = 56;
  const C = 2 * Math.PI * R;

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-10 animate-fade-up">
      <div className="bg-ink-900 border border-ink-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-dots text-ink-700 opacity-20 pointer-events-none" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={R} fill="none" stroke="var(--color-ink-800)" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={R} fill="none"
                  stroke={percentage >= 80 ? "var(--color-glow-400)" : percentage >= 60 ? "var(--color-emerald-400)" : percentage >= 40 ? "var(--color-sky-400)" : "var(--color-red-400)"}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - percentage / 100)}
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-ink-100">{percentage}%</span>
                <span className="text-[10px] text-ink-500 font-mono uppercase tracking-widest">得分率</span>
              </div>
            </div>
            <Trophy size={28} className={`mt-4 ${rank.color}`} />
            <div className={`mt-2 text-sm font-bold uppercase tracking-widest ${rank.color}`}>{rank.title}</div>
            <p className="text-ink-400 text-sm mt-2 italic text-pretty">"{rank.desc}"</p>
            {bestScore !== null && bestScore >= score && score > 0 && (
              <p className="text-[11px] text-ink-500 mt-1 font-mono">历史最佳 {bestScore} 分</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-ink-850 p-4 rounded-2xl border border-ink-800 text-center">
              <div className="text-2xl font-bold text-ink-100">{score} <span className="text-xs text-ink-500 font-normal">/ {maxScore}</span></div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">总得分</div>
            </div>
            <div className="bg-ink-850 p-4 rounded-2xl border border-ink-800 text-center">
              <div className="text-2xl font-bold text-ink-100">{correctCount} <span className="text-xs text-ink-500 font-normal">/ {questions.length}</span></div>
              <div className="text-[10px] text-ink-500 uppercase tracking-wider mt-1">全对题数</div>
            </div>
          </div>

          <div className="bg-ink-850 p-6 rounded-2xl border border-ink-800 mt-4">
            <div className="flex items-center gap-2 mb-4 justify-center text-xs font-bold text-ink-400 uppercase tracking-widest">
              <BarChart2 size={14} /> 难度掌握度
            </div>
            <div className="grid grid-cols-3 gap-4">
              {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => {
                const s = stats[diff];
                const rate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={diff} className="flex flex-col gap-2">
                    <div className={`text-[10px] font-bold text-center ${DIFFICULTY_COLORS[diff].text}`}>{diff}</div>
                    <div className="h-24 w-full bg-ink-800 rounded-xl relative flex flex-col justify-end overflow-hidden">
                      <div className={`w-full rounded-xl transition-all duration-1000 ${DIFFICULTY_COLORS[diff].bar}`} style={{ height: `${Math.max(rate, 4)}%`, opacity: 0.55 }} />
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-100">{rate}%</div>
                    </div>
                    <div className="text-[10px] text-ink-500 text-center">{s.correct}/{s.total}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {weakSpots.length > 0 && (
            <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-5 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-widest mb-3">
                <Target size={14} /> 待强化分类
              </div>
              <div className="space-y-2">
                {weakSpots.map((s) => (
                  <div key={s.cat} className="flex items-center justify-between text-sm">
                    <span className="text-ink-300">{categoryLabel(s.cat)}</span>
                    <span className="text-red-300 font-mono text-xs">{s.correct}/{s.total} · {s.rate}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <button onClick={() => setOpenReview(openReview === null ? 0 : null)} className="w-full py-3 bg-ink-850 hover:bg-ink-800 border border-ink-700 rounded-xl text-ink-200 font-bold transition-colors flex items-center justify-center gap-2">
              逐题回顾 <ChevronDown size={16} className={`transition-transform ${openReview !== null ? "rotate-180" : ""}`} />
            </button>
            {openReview !== null && (
              <div className="mt-3 space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                {questions.map((q, i) => {
                  const rec = records[i];
                  if (!rec) return null;
                  return (
                    <div key={q.id} className="bg-ink-850 border border-ink-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${rec.status === "CORRECT" ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30" : rec.status === "PARTIAL" ? "bg-yellow-300/10 text-yellow-200 border border-yellow-300/30" : "bg-red-400/10 text-red-300 border border-red-400/30"}`}>
                          {rec.status === "CORRECT" ? "正确" : rec.status === "PARTIAL" ? "部分" : "错误"}
                        </span>
                        <span className="text-[10px] text-ink-500 font-mono">+{rec.points}分</span>
                        <span className="text-[10px] text-ink-500">第{i + 1}题</span>
                      </div>
                      <div className="text-sm text-ink-200 leading-snug text-pretty">{q.question}</div>
                      <div className="mt-2 text-xs text-ink-400"><span className="text-ink-500">你的答案：</span>{rec.userAnswer}</div>
                      <div className="mt-1 text-xs text-emerald-300/90"><span className="text-ink-500">参考答案：</span>{Array.isArray(q.correctAnswer) ? q.correctAnswer.join("、") : q.correctAnswer}</div>
                      <div className="mt-1 text-xs text-ink-400 leading-relaxed">{q.explanation}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onHome} className="flex-1 py-3.5 bg-ink-850 hover:bg-ink-800 border border-ink-700 text-ink-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Home size={16} /> 返回首页
            </button>
            <button onClick={onRestart} className="flex-1 py-3.5 bg-glow-500 hover:bg-glow-400 text-ink-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
              <RefreshCw size={16} /> 再来一轮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
