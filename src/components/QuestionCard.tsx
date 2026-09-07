"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, ArrowUp, ArrowDown, Link2, Timer } from "lucide-react";
import { QuizQuestion } from "@/data/quizData";
import { ResultStatus } from "@/types";

const MATCH_STYLES = [
  { border: "border-glow-400", bg: "bg-glow-400/10", text: "text-glow-300", badge: "bg-glow-400 text-ink-950" },
  { border: "border-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-300", badge: "bg-emerald-400 text-ink-950" },
  { border: "border-sky-400", bg: "bg-sky-400/10", text: "text-sky-300", badge: "bg-sky-400 text-ink-950" },
  { border: "border-red-400", bg: "bg-red-400/10", text: "text-red-300", badge: "bg-red-400 text-ink-950" },
  { border: "border-yellow-300", bg: "bg-yellow-300/10", text: "text-yellow-200", badge: "bg-yellow-300 text-ink-950" },
];

interface Props {
  question: QuizQuestion;
  revealed: boolean;
  onSubmit: (points: number, status: ResultStatus, userAnswer: string) => void;
}

export const QuestionCard: React.FC<Props> = ({ question, revealed, onSubmit }) => {
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [tempSelection, setTempSelection] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [orderedOptions, setOrderedOptions] = useState<string[]>([]);
  const [matchingPairs, setMatchingPairs] = useState<Record<number, number>>({});
  const [activeLeftIndex, setActiveLeftIndex] = useState<number | null>(null);
  const [interactiveValue, setInteractiveValue] = useState(0);

  useEffect(() => {
    if (question.type === "SINGLE" || question.type === "MULTI" || question.type === "TRUE_FALSE") {
      setShuffledOptions(shuffle([...question.options]));
    } else if (question.type === "MATCHING") {
      setShuffledOptions(shuffle([...(question.correctAnswer as string[])]));
    } else if (question.type === "ORDER") {
      setOrderedOptions(shuffle([...question.options]));
    } else if (question.type === "INTERACTIVE" && question.interactive) {
      const { min, max } = question.interactive;
      let startVal = min + (max - min) / 2;
      if (Math.abs(startVal - question.interactive.correctValue) < (max - min) * 0.1) {
        startVal = min;
      }
      setInteractiveValue(Math.floor(startVal));
    }
    setTempSelection(null);
    setSelectedIndices([]);
    setMatchingPairs({});
    setActiveLeftIndex(null);
  }, [question]);

  const canSubmit = useMemo(() => {
    switch (question.type) {
      case "SINGLE":
      case "TRUE_FALSE":
        return tempSelection !== null;
      case "MULTI":
        return selectedIndices.length > 0;
      case "ORDER":
        return true;
      case "MATCHING":
        return Object.keys(matchingPairs).length === question.options.length;
      case "INTERACTIVE":
        return true;
      default:
        return false;
    }
  }, [question.type, tempSelection, selectedIndices, matchingPairs]);

  const handleSubmit = () => {
    if (revealed || !canSubmit) return;
    let points = 0;
    let status: ResultStatus = "WRONG";
    let userAnswer = "";
    const PTS = 10;

    if (question.type === "SINGLE" || question.type === "TRUE_FALSE") {
      const isCorrect = tempSelection === question.correctAnswer;
      points = isCorrect ? PTS : 0;
      status = isCorrect ? "CORRECT" : "WRONG";
      userAnswer = tempSelection ?? "";
    } else if (question.type === "MULTI") {
      const selectedOptions = selectedIndices.map((i) => shuffledOptions[i]);
      const correctOptions = question.correctAnswer as string[];
      const wrongPicks = selectedOptions.filter((o) => !correctOptions.includes(o));
      const correctPicks = selectedOptions.filter((o) => correctOptions.includes(o));
      if (wrongPicks.length > 0) {
        points = 0;
        status = "WRONG";
      } else if (correctPicks.length === correctOptions.length) {
        points = PTS;
        status = "CORRECT";
      } else if (correctPicks.length > 0) {
        points = Math.floor((correctPicks.length / correctOptions.length) * PTS);
        status = "PARTIAL";
      }
      userAnswer = selectedOptions.join("、") || "（未选择）";
    } else if (question.type === "ORDER") {
      const isCorrect = JSON.stringify(orderedOptions) === JSON.stringify(question.correctAnswer);
      points = isCorrect ? PTS : 0;
      status = isCorrect ? "CORRECT" : "WRONG";
      userAnswer = orderedOptions.join(" → ");
    } else if (question.type === "MATCHING") {
      let correctCount = 0;
      const total = question.options.length;
      const correctAnswers = question.correctAnswer as string[];
      Object.keys(matchingPairs).forEach((leftIdxStr) => {
        const leftIdx = Number(leftIdxStr);
        if (shuffledOptions[matchingPairs[leftIdx]] === correctAnswers[leftIdx]) correctCount++;
      });
      if (correctCount === total) {
        points = PTS;
        status = "CORRECT";
      } else if (correctCount > 0) {
        points = Math.floor((correctCount / total) * PTS);
        status = "PARTIAL";
      }
      userAnswer = `正确配对 ${correctCount}/${total}`;
    } else if (question.type === "INTERACTIVE" && question.interactive) {
      const diff = Math.abs(interactiveValue - question.interactive.correctValue);
      const isCorrect = diff <= question.interactive.tolerance;
      points = isCorrect ? PTS : 0;
      status = isCorrect ? "CORRECT" : "WRONG";
      userAnswer = `${interactiveValue}${question.interactive.unit}`;
    }

    onSubmit(points, status, userAnswer);
  };

  useEffect(() => {
    if (revealed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (question.type === "SINGLE" || question.type === "TRUE_FALSE") {
          if (idx < shuffledOptions.length) setTempSelection(shuffledOptions[idx]);
        } else if (question.type === "MULTI") {
          if (idx < shuffledOptions.length) {
            setSelectedIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, question, shuffledOptions, tempSelection, selectedIndices, matchingPairs, orderedOptions, interactiveValue]);

  const handleMatchingClick = (side: "LEFT" | "RIGHT", index: number) => {
    if (revealed) return;
    if (side === "LEFT") {
      if (matchingPairs[index] !== undefined) {
        const newPairs = { ...matchingPairs };
        delete newPairs[index];
        setMatchingPairs(newPairs);
        setActiveLeftIndex(index);
      } else {
        setActiveLeftIndex(index);
      }
    } else {
      if (activeLeftIndex !== null) {
        const existingOwner = Object.keys(matchingPairs).find((key) => matchingPairs[Number(key)] === index);
        const newPairs = { ...matchingPairs };
        if (existingOwner) delete newPairs[Number(existingOwner)];
        newPairs[activeLeftIndex] = index;
        setMatchingPairs(newPairs);
        setActiveLeftIndex(null);
      }
    }
  };

  const handleOrderMove = (idx: number, direction: -1 | 1) => {
    if (revealed) return;
    const newOrder = [...orderedOptions];
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setOrderedOptions(newOrder);
  };

  const baseOpt = "p-4 rounded-2xl border-2 text-left font-semibold transition-all duration-200 flex items-center gap-3";
  const idleOpt = "bg-ink-850 border-ink-700 text-ink-300 hover:border-ink-400 hover:bg-ink-800 hover:-translate-y-0.5";
  const selectedOpt = "bg-glow-400/10 border-glow-400 text-glow-200 shadow-[0_0_24px_oklch(0.78_0.16_75/0.15)]";
  const correctOpt = "bg-emerald-400/10 border-emerald-400 text-emerald-200";
  const wrongOpt = "bg-red-400/10 border-red-400/70 text-red-300 opacity-80";
  const dimOpt = "bg-ink-900 border-ink-800 text-ink-500 opacity-40";

  if (question.type === "SINGLE" || question.type === "TRUE_FALSE") {
    return (
      <div className="space-y-4">
        <div className={`grid gap-3 ${question.type === "TRUE_FALSE" ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
          {shuffledOptions.map((opt, idx) => {
            const isCorrect = opt === question.correctAnswer;
            const isSelected = tempSelection === opt;
            let style = idleOpt;
            if (!revealed) {
              if (isSelected) style = selectedOpt;
            } else {
              if (isCorrect) style = correctOpt;
              else if (isSelected) style = wrongOpt;
              else style = dimOpt;
            }
            return (
              <button key={idx} onClick={() => !revealed && setTempSelection(opt)} disabled={revealed} className={`${baseOpt} ${style} relative overflow-hidden`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono border shrink-0 ${isSelected && !revealed ? "border-glow-400 text-glow-300" : "border-ink-600 text-ink-400"}`}>{idx + 1}</span>
                <span className="leading-snug">{opt}</span>
                {revealed && isCorrect && <CheckCircle2 size={20} className="text-emerald-400 ml-auto shrink-0" />}
                {revealed && isSelected && !isCorrect && <XCircle size={20} className="text-red-400 ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
        {!revealed && tempSelection && (
          <button onClick={handleSubmit} className="w-full py-3.5 bg-glow-500 hover:bg-glow-400 text-ink-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
            确认提交 <span className="text-[10px] bg-ink-950/20 px-1.5 py-0.5 rounded font-mono">Enter</span>
          </button>
        )}
      </div>
    );
  }

  if (question.type === "MULTI") {
    return (
      <div className="space-y-4">
        <div className="text-xs text-ink-400 font-semibold flex items-center gap-2 mb-2">
          <AlertCircle size={14} className="text-glow-400" /> 选择所有正确选项（错选不得分，少选得部分分）
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {shuffledOptions.map((opt, idx) => {
            const isSelected = selectedIndices.includes(idx);
            const isCorrectOpt = (question.correctAnswer as string[]).includes(opt);
            let style = idleOpt;
            if (isSelected && !revealed) style = selectedOpt;
            if (revealed) {
              if (isSelected && isCorrectOpt) style = correctOpt;
              else if (isSelected && !isCorrectOpt) style = wrongOpt;
              else if (!isSelected && isCorrectOpt) style = "bg-yellow-300/10 border-yellow-300/70 text-yellow-200";
              else style = dimOpt;
            }
            return (
              <button key={idx} onClick={() => !revealed && setSelectedIndices((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]))} disabled={revealed} className={`${baseOpt} ${style}`}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono border shrink-0 ${isSelected && !revealed ? "border-glow-400 text-glow-300" : "border-ink-600 text-ink-400"}`}>{idx + 1}</span>
                <span className="flex-1 leading-snug">{opt}</span>
                {revealed && isCorrectOpt && !isSelected && <AlertCircle size={16} className="text-yellow-300 shrink-0" />}
                {revealed && isCorrectOpt && isSelected && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                {revealed && isSelected && !isCorrectOpt && <XCircle size={16} className="text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>
        <button onClick={handleSubmit} disabled={revealed || selectedIndices.length === 0} className="w-full py-3.5 bg-glow-500 hover:bg-glow-400 disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
          提交答案 {!revealed && <span className="text-[10px] bg-ink-950/20 px-1.5 py-0.5 rounded font-mono">Enter</span>}
        </button>
      </div>
    );
  }

  if (question.type === "MATCHING") {
    return (
      <div className="space-y-6">
        <div className="text-xs text-ink-400 font-semibold flex items-center gap-2">
          <Link2 size={14} className="text-glow-400" /> 配对模式：点击左侧选中，再点击右侧目标
        </div>
        <div className="flex flex-row gap-2 md:gap-8">
          <div className="flex-1 space-y-2">
            {question.options.map((opt, idx) => {
              const isMatched = matchingPairs[idx] !== undefined;
              const isActive = activeLeftIndex === idx;
              const style = isMatched ? MATCH_STYLES[idx % MATCH_STYLES.length] : null;
              const cls = isActive
                ? "border-glow-400 bg-ink-700 text-ink-100 shadow-lg scale-[1.02] z-10"
                : isMatched
                  ? `${style?.border} ${style?.bg} ${style?.text}`
                  : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-400 hover:bg-ink-800";
              return (
                <button key={idx} onClick={() => handleMatchingClick("LEFT", idx)} disabled={revealed} className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all relative flex items-center gap-2 ${cls}`}>
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${isMatched ? style?.badge : "bg-ink-700 text-ink-400"}`}>{String.fromCharCode(65 + idx)}</span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
          <div className="flex-1 space-y-2">
            {shuffledOptions.map((opt, idx) => {
              const linkerIdx = Object.keys(matchingPairs).find((key) => matchingPairs[Number(key)] === idx);
              const isMatched = linkerIdx !== undefined;
              const style = isMatched ? MATCH_STYLES[Number(linkerIdx) % MATCH_STYLES.length] : null;
              let revealCls = "";
              if (revealed && isMatched) {
                const correctRight = (question.correctAnswer as string[])[Number(linkerIdx)];
                revealCls = opt === correctRight ? "ring-2 ring-emerald-400" : "ring-2 ring-red-400/70 opacity-60 grayscale";
              }
              return (
                <button key={idx} onClick={() => handleMatchingClick("RIGHT", idx)} disabled={revealed} className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all flex items-center gap-2 justify-between ${revealCls} ${isMatched ? `${style?.border} ${style?.bg} ${style?.text}` : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-400 hover:bg-ink-800"}`}>
                  <span className="leading-snug flex-1">{opt}</span>
                  {isMatched ? (
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${style?.badge}`}>{String.fromCharCode(65 + Number(linkerIdx))}</span>
                  ) : (
                    <span className="w-6 h-6 rounded-lg border border-ink-600 bg-ink-900 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={handleSubmit} disabled={revealed || Object.keys(matchingPairs).length !== question.options.length} className="w-full py-3.5 bg-glow-500 hover:bg-glow-400 disabled:opacity-40 disabled:cursor-not-allowed text-ink-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
          提交连线
        </button>
        {revealed && (
          <div className="text-sm p-4 bg-ink-900 rounded-2xl border border-ink-800 grid gap-2">
            <strong className="text-emerald-300 border-b border-ink-700 pb-2 block">正确配对：</strong>
            {question.options.map((opt, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span className="text-ink-400 font-semibold">{String.fromCharCode(65 + i)}. {opt}</span>
                <span className="text-ink-100 text-right">→ {(question.correctAnswer as string[])[i]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (question.type === "ORDER") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {orderedOptions.map((opt, idx) => (
            <div key={opt} className={`p-3.5 rounded-2xl border-2 bg-ink-850 border-ink-700 flex items-center gap-4 transition-colors ${revealed ? (JSON.stringify(orderedOptions) === JSON.stringify(question.correctAnswer) ? "border-emerald-400" : "border-red-400/70") : ""}`}>
              <div className="text-ink-500 font-mono font-bold w-7 text-center">#{idx + 1}</div>
              <div className="flex-1 font-semibold text-ink-100 text-sm">{opt}</div>
              {!revealed && (
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleOrderMove(idx, -1)} disabled={idx === 0} className="p-1.5 hover:bg-ink-700 rounded-lg text-ink-400 hover:text-ink-100 disabled:opacity-20 transition-colors" aria-label="上移">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => handleOrderMove(idx, 1)} disabled={idx === orderedOptions.length - 1} className="p-1.5 hover:bg-ink-700 rounded-lg text-ink-400 hover:text-ink-100 disabled:opacity-20 transition-colors" aria-label="下移">
                    <ArrowDown size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={handleSubmit} disabled={revealed} className="w-full py-3.5 bg-glow-500 hover:bg-glow-400 disabled:opacity-40 text-ink-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
          确认顺序 {!revealed && <span className="text-[10px] bg-ink-950/20 px-1.5 py-0.5 rounded font-mono">Enter</span>}
        </button>
        {revealed && (
          <div className="text-sm text-ink-300 p-4 bg-ink-900 rounded-2xl border border-ink-800">
            <strong className="text-emerald-300">正确顺序：</strong> {(question.correctAnswer as string[]).join(" → ")}
          </div>
        )}
      </div>
    );
  }

  if (question.type === "INTERACTIVE" && question.interactive) {
    const conf = question.interactive;
    const diff = Math.abs(interactiveValue - conf.correctValue);
    const isClose = diff <= conf.tolerance;
    let vizBg = "bg-ink-700";
    if (conf.visual === "COLOR_TEMP") {
      if (interactiveValue < 4000) vizBg = "bg-glow-500";
      else if (interactiveValue > 7000) vizBg = "bg-sky-400";
      else vizBg = "bg-ink-200";
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-6 bg-ink-900 rounded-2xl border border-ink-800 p-5">
          <div className={`w-24 h-24 rounded-full shadow-[0_0_36px_currentColor] transition-colors duration-300 ${vizBg} flex items-center justify-center shrink-0`}>
            {conf.visual === "SHUTTER" && <Timer size={26} className="text-ink-950" />}
            {conf.visual === "FOCAL_LENGTH" && <span className="text-ink-950 font-bold text-sm">{interactiveValue}mm</span>}
            {conf.visual === "ISO" && <span className="text-ink-950 font-bold text-sm">ISO</span>}
            {conf.visual === "AUDIO_HZ" && <span className="text-ink-950 font-bold text-sm">AUDIO</span>}
            {conf.visual === "COLOR_TEMP" && <span className="text-ink-950 font-bold text-sm">{interactiveValue}K</span>}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs font-semibold text-ink-400 block">调整数值</span>
                <span className="text-[10px] text-ink-600">允许误差 ±{conf.tolerance} {conf.unit}</span>
              </div>
              <span className={`text-2xl font-mono font-bold ${revealed ? (isClose ? "text-emerald-300" : "text-red-300") : "text-glow-300"}`}>
                {interactiveValue} <span className="text-sm text-ink-500">{conf.unit}</span>
              </span>
            </div>
            <input type="range" min={conf.min} max={conf.max} step={conf.step} value={interactiveValue} onChange={(e) => setInteractiveValue(Number(e.target.value))} disabled={revealed} aria-label="调整数值滑杆" />
            <div className="flex justify-between text-[11px] text-ink-600 font-mono"><span>{conf.min}</span><span>{conf.max}</span></div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={revealed} className="w-full py-3.5 bg-glow-500 hover:bg-glow-400 disabled:opacity-40 text-ink-950 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-glow-900/40 active:scale-[0.99]">
          确认数值 {!revealed && <span className="text-[10px] bg-ink-950/20 px-1.5 py-0.5 rounded font-mono">Enter</span>}
        </button>
        {revealed && (
          <div className="space-y-2">
            <div className="p-4 bg-ink-900 border border-ink-800 rounded-2xl text-sm flex justify-between items-center">
              <span className="text-ink-400">正确数值：</span>
              <span className="font-mono font-bold text-emerald-300">{conf.correctValue} {conf.unit}</span>
            </div>
            {!isClose && (
              <div className="p-4 bg-yellow-300/10 border border-yellow-300/30 rounded-2xl text-xs text-yellow-200">
                <strong>提示：</strong> 您的选择偏{interactiveValue > conf.correctValue ? "高" : "低"}了 {Math.abs(interactiveValue - conf.correctValue)} {conf.unit}。
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
};

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
