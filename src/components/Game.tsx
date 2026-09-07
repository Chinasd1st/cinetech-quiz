"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Timer, HelpCircle, ChevronRight, Keyboard, LogOut } from "lucide-react";
import { QuizQuestion } from "@/data/quizData";
import { AnswerRecord, ResultStatus } from "@/types";
import { QuestionCard } from "./QuestionCard";
import { DIFFICULTY_COLORS, TYPE_LABELS, categoryLabel } from "@/utils/quiz";

const QUESTION_TIME = 45;

interface Props {
  questions: QuizQuestion[];
  onFinish: (records: AnswerRecord[], score: number) => void;
  onQuit: () => void;
}

export const Game: React.FC<Props> = ({ questions, onFinish, onQuit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [revealed, setRevealed] = useState(false);
  const [earned, setEarned] = useState(0);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const finishRef = useRef(false);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setRevealed(false);
    setEarned(0);
    setTimeLeft(QUESTION_TIME);
  }, [currentIndex]);

  const handleAnswer = useCallback(
    (points: number, status: ResultStatus, userAnswer: string) => {
      if (finishRef.current) return;
      setRevealed(true);
      setEarned(points);
      setScore((s) => s + points);
      setRecords((prev) => [...prev, { questionId: currentQ.id, status, points, userAnswer }]);
    },
    [currentQ.id]
  );

  useEffect(() => {
    if (revealed || timeLeft <= 0) return;
    const t = window.setTimeout(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswer(0, "WRONG", "超时未作答");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearTimeout(t);
  }, [timeLeft, revealed, handleAnswer]);

  const nextQuestion = useCallback(() => {
    if (finishRef.current) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishRef.current = true;
      onFinish(records, score);
    }
  }, [currentIndex, questions.length, records, score, onFinish]);

  useEffect(() => {
    if (!revealed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, nextQuestion]);

  const isLast = currentIndex === questions.length - 1;
  const timeRatio = timeLeft / QUESTION_TIME;

  return (
    <div className="min-h-dvh flex flex-col">
      <div className="w-full max-w-3xl mx-auto pt-5 pb-4 px-4 shrink-0 z-10 bg-ink-950/90 backdrop-blur-sm sticky top-0 border-b border-ink-850">
        <div className="flex justify-between items-end mb-2.5">
          <div className="text-sm font-semibold text-ink-400">
            Question <span className="text-ink-100 text-xl font-display font-bold">{currentIndex + 1}</span>
            <span className="text-ink-600">/{questions.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmQuit(true)}
              className="p-2 rounded-lg text-ink-500 hover:text-ink-200 hover:bg-ink-850 transition-colors"
              aria-label="退出考试"
              title="退出考试"
            >
              <LogOut size={18} />
            </button>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 10 ? "text-red-400 animate-pulse-soft" : "text-ink-100"}`}>
              <Timer size={20} className={timeLeft < 10 ? "text-red-400" : "text-glow-400"} /> {timeLeft}s
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex w-full gap-[2px] h-1.5 rounded-full overflow-hidden">
            {questions.map((_, i) => {
              const rec = records[i];
              let color = "bg-ink-800";
              if (i === currentIndex && !rec) color = "bg-glow-500 animate-pulse-soft";
              else if (rec?.status === "CORRECT") color = "bg-emerald-400";
              else if (rec?.status === "PARTIAL") color = "bg-yellow-300";
              else if (rec?.status === "WRONG") color = "bg-red-400";
              return <div key={i} className={`flex-1 transition-colors duration-300 rounded-sm ${color}`} />;
            })}
          </div>
          <div className="w-8 shrink-0 text-right font-mono text-[11px] text-ink-500">{score}分</div>
        </div>
        <div className="h-0.5 w-full rounded-full bg-ink-850 overflow-hidden">
          <div className={`h-full bg-glow-500 transition-all duration-1000 ease-linear ${timeLeft <= 10 ? "bg-red-400" : ""}`} style={{ width: `${timeRatio * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24 animate-fade-up" key={currentIndex}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-wide text-glow-300 uppercase bg-glow-400/10 rounded-full border border-glow-400/25">{categoryLabel(currentQ.category)}</span>
              <span className={`inline-block px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full border ${DIFFICULTY_COLORS[currentQ.difficulty].badge}`}>{currentQ.difficulty}</span>
              <span className="inline-block px-3 py-1 text-xs font-bold tracking-wide text-ink-300 uppercase bg-ink-850 rounded-full border border-ink-700">{TYPE_LABELS[currentQ.type]}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-ink-100 leading-snug text-pretty">{currentQ.question}</h2>
          </div>

          <div className="mb-6">
            <QuestionCard question={currentQ} revealed={revealed} onSubmit={handleAnswer} />
          </div>

          {revealed && (
            <div className="bg-ink-900 border border-ink-700 p-5 rounded-2xl animate-fade-up">
              <div className="flex items-center justify-between mb-3 border-b border-ink-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-bold ${earned === 10 ? "text-emerald-300" : earned > 0 ? "text-yellow-300" : "text-red-300"}`}>
                    {earned > 0 ? `+${earned}` : "0"} 分
                  </span>
                  {earned > 0 && earned < 10 && <span className="text-[10px] bg-yellow-300/10 text-yellow-200 px-1.5 py-0.5 rounded border border-yellow-300/20">部分得分</span>}
                </div>
                <div className="text-[10px] text-ink-500 flex items-center gap-1"><Keyboard size={12} /> Enter 下一题</div>
              </div>
              <div className="flex items-start gap-3">
                <HelpCircle className="text-glow-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="font-bold text-ink-100 text-xs mb-1">技术解析</h4>
                  <p className="text-sm text-ink-300 leading-relaxed text-pretty">{currentQ.explanation}</p>
                </div>
              </div>
              <button onClick={nextQuestion} className="w-full mt-4 py-3.5 bg-ink-100 hover:bg-white text-ink-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]">
                {isLast ? "查看成绩" : "下一题"} <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmQuit && (
        <div className="fixed inset-0 z-50 bg-ink-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-ink-900 border border-ink-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-lg font-bold text-ink-100 mb-2">确定退出本次考试？</h3>
            <p className="text-sm text-ink-400 mb-6">已答 {records.length}/{questions.length} 题，退出后成绩不保存。</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmQuit(false)} className="flex-1 py-3 bg-ink-850 hover:bg-ink-800 text-ink-200 font-bold rounded-xl transition-colors">继续答题</button>
              <button onClick={onQuit} className="flex-1 py-3 bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 text-red-300 font-bold rounded-xl transition-colors">确认退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
