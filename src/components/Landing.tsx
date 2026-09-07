"use client";

import React, { useMemo, useState } from "react";
import { Play, ShieldCheck, CircleDot, ListChecks, Scale, ArrowDownUp, Link2, SlidersHorizontal, Settings2, Shuffle, BookOpen, ArrowRight, Sparkles } from "lucide-react";
import { QUIZ_DATABASE } from "@/data/quizData";
import { ConfigState } from "@/types";
import { ApertureMark } from "./ApertureMark";
import { countByDifficulty } from "@/utils/quiz";

interface Props {
  config: ConfigState;
  setConfig: (c: ConfigState) => void;
  onStart: () => void;
  onAdmin: () => void;
}

const TYPE_FEATURES = [
  { icon: CircleDot, name: "单选", desc: "经典四选一，排除法也能赢" },
  { icon: ListChecks, name: "多选", desc: "少选得部分分，错选零分" },
  { icon: Scale, name: "判断", desc: "一眼真伪，陷阱藏在细节里" },
  { icon: ArrowDownUp, name: "排序", desc: "拖拽上下移动，还原正确顺序" },
  { icon: Link2, name: "连线", desc: "左右配对，考验知识映射" },
  { icon: SlidersHorizontal, name: "交互", desc: "拖动滑杆，调到准确数值" },
];

export const Landing: React.FC<Props> = ({ config, setConfig, onStart, onAdmin }) => {
  const [customCount, setCustomCount] = useState(String(config.count));
  const poolStats = useMemo(() => countByDifficulty(QUIZ_DATABASE), []);
  const total = QUIZ_DATABASE.length;

  const handlePreset = (count: number) => {
    const valid = Math.min(count, total);
    setConfig({ ...config, count: valid });
    setCustomCount(String(valid));
  };

  const handleCustom = (val: string) => {
    setCustomCount(val);
    const num = parseInt(val);
    if (!Number.isNaN(num) && num > 0) setConfig({ ...config, count: Math.min(num, total) });
  };

  const handleCustomBlur = () => {
    let num = parseInt(customCount);
    if (Number.isNaN(num) || num < 1) num = 5;
    if (num > total) num = total;
    setCustomCount(String(num));
    setConfig({ ...config, count: num });
  };

  const handleDist = (type: "easy" | "medium" | "hard", val: number) => {
    setConfig({ ...config, dist: { ...config.dist, [type]: val } });
  };

  const distTotal = config.dist.easy + config.dist.medium + config.dist.hard || 1;
  const targetPreview = {
    easy: Math.round(config.count * (config.dist.easy / distTotal)),
    medium: Math.round(config.count * (config.dist.medium / distTotal)),
    hard: config.count - Math.round(config.count * (config.dist.easy / distTotal)) - Math.round(config.count * (config.dist.medium / distTotal)),
  };

  return (
    <div className="min-h-dvh relative overflow-hidden">
      <div className="absolute inset-0 bg-dots text-ink-800 opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-glow-500/10 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-sky-500/5 blur-3xl pointer-events-none" aria-hidden="true" />

      <header className="relative z-10 max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ApertureMark size={30} className="text-glow-400 animate-spin-slow" />
          <div className="font-display font-bold text-ink-100 tracking-tight">
            CineTech <span className="text-glow-400">Quiz</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block px-3 py-1 text-[10px] font-bold text-glow-300 uppercase tracking-widest bg-glow-400/10 border border-glow-400/25 rounded-full">
            For TGTV
          </span>
          <button onClick={onAdmin} className="flex items-center gap-2 px-4 py-2 bg-ink-850 hover:bg-ink-800 border border-ink-700 text-ink-200 rounded-xl text-sm font-bold transition-colors">
            <ShieldCheck size={15} className="text-glow-400" /> 管理员模式
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-5">
        <section className="pt-10 md:pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink-850 border border-ink-700 text-xs text-ink-300 font-mono mb-6 animate-fade-up">
            <BookOpen size={12} className="text-glow-400" /> CINETECH ARCHITECTURE · 独立考场分部
          </div>
          <h1 className="font-display font-bold tracking-tighter text-5xl md:text-7xl text-ink-100 animate-fade-up" style={{ animationDelay: "80ms" }}>
            光影<span className="text-glow-400">考场</span>
          </h1>
          <p className="text-ink-400 text-base md:text-lg max-w-xl mx-auto mt-5 leading-relaxed text-pretty animate-fade-up" style={{ animationDelay: "160ms" }}>
            从 <span className="text-ink-200 font-semibold">CineTech Architecture</span> 独立出来的影视技术答题应用。
            光学、传感器、编码、布光、录音与调色，每一题都有即时解析。
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-up" style={{ animationDelay: "240ms" }}>
            <div className="px-5 py-3 bg-ink-900 border border-ink-800 rounded-2xl">
              <div className="text-2xl font-display font-bold text-ink-100">{total}</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-widest">精选题库</div>
            </div>
            <div className="px-5 py-3 bg-ink-900 border border-ink-800 rounded-2xl">
              <div className="text-2xl font-display font-bold text-ink-100">6</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-widest">种题型</div>
            </div>
            <div className="px-5 py-3 bg-ink-900 border border-ink-800 rounded-2xl">
              <div className="text-2xl font-display font-bold text-ink-100">20</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-widest">个知识分类</div>
            </div>
            <div className="px-5 py-3 bg-ink-900 border border-ink-800 rounded-2xl">
              <div className="text-2xl font-display font-bold text-ink-100 font-mono">45s</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-widest">每题限时</div>
            </div>
          </div>

          <div className="flex justify-center mt-10 animate-fade-up" style={{ animationDelay: "320ms" }}>
            <button onClick={onStart} className="group inline-flex items-center gap-3 px-10 py-4 bg-glow-500 hover:bg-glow-400 text-ink-950 font-display font-bold text-lg rounded-full shadow-xl shadow-glow-900/40 transition-all hover:scale-105 active:scale-100">
              <Play size={20} className="fill-current" /> 开始挑战
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-[11px] text-ink-500 mt-3 animate-fade-up" style={{ animationDelay: "360ms" }}>
            使用默认配置（10 题 · 30/50/20 难度分布），或先在下方自定义
          </p>
        </section>

        <section className="pb-12">
          <h2 className="text-sm font-bold text-ink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-glow-400" /> 六种题型，全部在线
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TYPE_FEATURES.map((f, i) => (
              <div key={f.name} className="bg-ink-900 border border-ink-800 rounded-2xl p-4 hover:border-glow-400/40 hover:-translate-y-0.5 transition-all animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <f.icon size={18} className="text-glow-400 mb-2" />
                <div className="font-bold text-ink-100 text-sm">{f.name}</div>
                <div className="text-[11px] text-ink-500 mt-0.5 leading-snug">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <div className="bg-ink-900 border border-ink-800 rounded-3xl p-6 md:p-8">
            <h2 className="text-lg font-display font-bold text-ink-100 mb-6 flex items-center gap-2">
              <Settings2 size={18} className="text-glow-400" /> 配置本轮挑战
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-3">题目数量</div>
                <div className="flex gap-2 mb-3">
                  {[5, 10, 15, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => handlePreset(count)}
                      className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${config.count === count ? "bg-glow-500 text-ink-950 shadow-lg shadow-glow-900/30" : "bg-ink-850 border border-ink-700 text-ink-300 hover:bg-ink-800"}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-ink-500 font-bold uppercase">Custom</span>
                  <input
                    type="number"
                    min={1}
                    max={total}
                    value={customCount}
                    onChange={(e) => handleCustom(e.target.value)}
                    onBlur={handleCustomBlur}
                    className="w-full bg-ink-850 border border-ink-700 rounded-xl py-3 pl-20 pr-14 text-ink-100 font-mono font-bold focus:border-glow-400 outline-none transition-colors"
                    aria-label="自定义题目数量"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">/ {total}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-ink-500 uppercase tracking-widest mb-3">难度分布</div>
                <div className="space-y-4">
                  {([
                    { key: "easy" as const, label: "EASY", cls: "text-emerald-300" },
                    { key: "medium" as const, label: "MED", cls: "text-sky-300" },
                    { key: "hard" as const, label: "HARD", cls: "text-red-300" },
                  ]).map((row) => (
                    <div key={row.key} className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${row.cls} w-12 text-right`}>{row.label}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={config.dist[row.key]}
                        onChange={(e) => handleDist(row.key, parseInt(e.target.value))}
                        aria-label={`${row.label} 难度占比`}
                      />
                      <span className="text-xs font-mono w-10 text-right text-ink-300">{config.dist[row.key]}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-[11px] text-ink-500 flex items-center gap-2">
                  <Shuffle size={12} className="text-glow-400 shrink-0" />
                  本轮约 {targetPreview.easy} 基础 / {targetPreview.medium} 进阶 / {targetPreview.hard} 硬核 · 题库现有 {poolStats.EASY}/{poolStats.MEDIUM}/{poolStats.HARD}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-14">
          <div className="relative overflow-hidden rounded-3xl border border-glow-400/30 bg-glow-400/5 p-6 md:p-8">
            <div className="absolute inset-0 bg-dots text-glow-400 opacity-10 pointer-events-none" aria-hidden="true" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <ApertureMark size={44} className="text-glow-400 shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-glow-300 uppercase tracking-widest mb-1">For TGTV</div>
                <p className="text-ink-200 text-sm md:text-base leading-relaxed text-pretty">
                  本考场为 <span className="text-glow-300 font-semibold">TGTV</span> 定制建设 —— 承接 CineTech Architecture 的影视技术知识体系，
                  独立运营、持续更新，献给每一位认真对待影像的人。
                </p>
              </div>
              <a href="../lensoptics-lab/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink-850 hover:bg-ink-800 border border-ink-700 text-ink-200 rounded-xl text-sm font-bold transition-colors shrink-0">
                返回主实验室 <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink-850">
        <div className="max-w-6xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-600">
          <div>© {new Date().getFullYear()} CineTech Quiz · 光影考场 <span className="text-glow-400">For TGTV</span></div>
          <div className="font-mono">Powered by Next.js · Tailwind v4</div>
        </div>
      </footer>
    </div>
  );
};
