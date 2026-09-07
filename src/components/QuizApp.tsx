"use client";

import React, { useCallback, useState } from "react";
import { AnswerRecord, ConfigState, ViewState } from "@/types";
import { selectQuestions, saveBestScore, loadBestScore } from "@/utils/quiz";
import { Landing } from "./Landing";
import { Game } from "./Game";
import { Summary } from "./Summary";
import { Admin } from "./Admin";

export default function QuizApp() {
  const [view, setView] = useState<ViewState>("landing");
  const [config, setConfig] = useState<ConfigState>({ count: 10, dist: { easy: 30, medium: 50, hard: 20 } });
  const [questions, setQuestions] = useState<ReturnType<typeof selectQuestions>>([]);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState<number | null>(() => loadBestScore());

  const handleStart = useCallback(() => {
    setQuestions(selectQuestions(config.count, config.dist));
    setRecords([]);
    setScore(0);
    setView("playing");
  }, [config]);

  const handleFinish = useCallback((recs: AnswerRecord[], finalScore: number) => {
    setRecords(recs);
    setScore(finalScore);
    saveBestScore(finalScore);
    setBestScore(loadBestScore());
    setView("summary");
  }, []);

  if (view === "admin") {
    return <Admin onBack={() => setView("landing")} />;
  }

  if (view === "playing") {
    return <Game questions={questions} onFinish={handleFinish} onQuit={() => setView("landing")} />;
  }

  if (view === "summary") {
    return (
      <Summary
        questions={questions}
        records={records}
        score={score}
        bestScore={bestScore}
        onRestart={() => setView("landing")}
        onHome={() => setView("landing")}
      />
    );
  }

  return <Landing config={config} setConfig={setConfig} onStart={handleStart} onAdmin={() => setView("admin")} />;
}
