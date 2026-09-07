"use client";

import React, { useMemo, useState } from "react";
import { Search, Download, ChevronDown, X, ShieldCheck, Filter } from "lucide-react";
import { QUIZ_DATABASE, QuizQuestion, Difficulty } from "@/data/quizData";
import { DIFFICULTY_COLORS, TYPE_LABELS, categoryLabel, countByCategory, countByDifficulty, countByType, downloadCsv } from "@/utils/quiz";

interface Props {
  onBack: () => void;
}

export const Admin: React.FC<Props> = ({ onBack }) => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [diffFilter, setDiffFilter] = useState<string>("ALL");
  const [catFilter, setCatFilter] = useState<string>("ALL");
  const [openId, setOpenId] = useState<number | null>(null);

  const diffStats = useMemo(() => countByDifficulty(QUIZ_DATABASE), []);
  const typeStats = useMemo(() => countByType(QUIZ_DATABASE), []);
  const catStats = useMemo(() => countByCategory(QUIZ_DATABASE), []);
  const categories = useMemo(() => [...new Set(QUIZ_DATABASE.map((q) => q.category))].sort(), []);
  const types = useMemo(() => [...new Set(QUIZ_DATABASE.map((q) => q.type))].sort(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QUIZ_DATABASE.filter((item) => {
      if (typeFilter !== "ALL" && item.type !== typeFilter) return false;
      if (diffFilter !== "ALL" && item.difficulty !== diffFilter) return false;
      if (catFilter !== "ALL" && item.category !== catFilter) return false;
      if (q) {
        const hay = [item.question, ...item.options, Array.isArray(item.correctAnswer) ? item.correctAnswer.join(" ") : item.correctAnswer, item.explanation].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, typeFilter, diffFilter, catFilter]);

  const maxCat = Math.max(...catStats.map(([, n]) => n), 1);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 bg-ink-950/90 backdrop-blur-sm border-b border-ink-850">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} className="text-glow-400" />
            <div>
              <h1 className="font-display font-bold text-ink-100 leading-tight">管理员模式</h1>
              <p className="text-[11px] text-ink-500">题库总览 · 浏览 · 导出</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadCsv(QUIZ_DATABASE)} className="flex items-center gap-2 px-4 py-2 bg-ink-850 hover:bg-ink-800 border border-ink-700 text-ink-200 rounded-xl text-sm font-bold transition-colors">
              <Download size={15} /> 导出 CSV
            </button>
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-glow-500 hover:bg-glow-400 text-ink-950 rounded-xl text-sm font-bold transition-all">
              <X size={15} /> 返回
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="题库总数" value={QUIZ_DATABASE.length} />
          <StatCard label="基础题" value={diffStats.EASY} accent="text-emerald-300" />
          <StatCard label="进阶题" value={diffStats.MEDIUM} accent="text-sky-300" />
          <StatCard label="硬核题" value={diffStats.HARD} accent="text-red-300" />
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-5">
            <div className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">题型分布</div>
            <div className="space-y-2">
              {types.map((t) => {
                const n = typeStats.get(t) ?? 0;
                const max = Math.max(...[...typeStats.values()], 1);
                return (
                  <div key={t} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-ink-300 font-semibold shrink-0">{TYPE_LABELS[t] ?? t}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-ink-800 overflow-hidden">
                      <div className="h-full bg-glow-400/70 rounded-full transition-all" style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-mono text-xs text-ink-400">{n}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-5">
            <div className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">分类分布</div>
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {catStats.map(([cat, n]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="w-20 text-xs text-ink-300 font-semibold shrink-0 truncate">{categoryLabel(cat)}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-ink-800 overflow-hidden">
                    <div className="h-full bg-sky-400/70 rounded-full transition-all" style={{ width: `${(n / maxCat) * 100}%` }} />
                  </div>
                  <span className="w-8 text-right font-mono text-xs text-ink-400">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink-900 border border-ink-800 rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索题干 / 选项 / 解析..."
                className="w-full bg-ink-850 border border-ink-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-ink-100 placeholder-ink-500 focus:border-glow-400 outline-none transition-colors"
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-ink-850 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-200 outline-none focus:border-glow-400">
              <option value="ALL">全部题型</option>
              {types.map((t) => <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>)}
            </select>
            <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)} className="bg-ink-850 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-200 outline-none focus:border-glow-400">
              <option value="ALL">全部难度</option>
              <option value="EASY">基础</option>
              <option value="MEDIUM">进阶</option>
              <option value="HARD">硬核</option>
            </select>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-ink-850 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-200 outline-none focus:border-glow-400">
              <option value="ALL">全部分类</option>
              {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
            <div className="flex items-center gap-1 text-xs text-ink-500 ml-auto">
              <Filter size={13} /> {filtered.length} / {QUIZ_DATABASE.length} 题
            </div>
          </div>

          <div className="space-y-2 max-h-[28rem] overflow-y-auto custom-scrollbar pr-1">
            {filtered.map((item) => (
              <QuestionRow key={item.id} item={item} open={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
            ))}
            {filtered.length === 0 && <div className="text-center py-10 text-ink-500 text-sm">没有匹配的题目</div>}
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; accent?: string }> = ({ label, value, accent }) => (
  <div className="bg-ink-900 border border-ink-800 rounded-2xl p-4 text-center">
    <div className={`text-3xl font-display font-bold ${accent ?? "text-ink-100"}`}>{value}</div>
    <div className="text-[10px] text-ink-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

const QuestionRow: React.FC<{ item: QuizQuestion; open: boolean; onToggle: () => void }> = ({ item, open, onToggle }) => {
  const answer = Array.isArray(item.correctAnswer) ? item.correctAnswer.join("、") : item.correctAnswer;
  return (
    <div className="bg-ink-850 border border-ink-800 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-ink-800 transition-colors">
        <span className="font-mono text-[11px] text-ink-500 w-14 shrink-0">#{item.id}</span>
        <span className="text-sm text-ink-200 flex-1 leading-snug line-clamp-1">{item.question}</span>
        <span className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${DIFFICULTY_COLORS[item.difficulty].badge}`}>{item.difficulty}</span>
        <span className="hidden md:inline-block px-2 py-0.5 text-[10px] text-ink-300 bg-ink-900 border border-ink-700 rounded">{TYPE_LABELS[item.type]}</span>
        <ChevronDown size={14} className={`text-ink-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 text-sm">
          {item.options.length > 0 && (
            <div className="grid gap-1">
              {item.options.map((opt, i) => {
                const isAnswer = Array.isArray(item.correctAnswer) ? item.correctAnswer.includes(opt) : item.correctAnswer === opt;
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${isAnswer ? "bg-emerald-400/10 text-emerald-200 border border-emerald-400/25" : "bg-ink-900 text-ink-400 border border-ink-800"}`}>
                    <span className="font-mono">{String.fromCharCode(65 + i)}</span> {opt}
                    {isAnswer && <CheckMark />}
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-xs text-ink-300"><span className="text-ink-500">答案：</span>{answer}</div>
          <div className="text-xs text-ink-400 leading-relaxed"><span className="text-ink-500">解析：</span>{item.explanation}</div>
        </div>
      )}
    </div>
  );
};

const CheckMark = () => (
  <svg className="ml-auto text-emerald-300 shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
