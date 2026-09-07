export type ResultStatus = "CORRECT" | "PARTIAL" | "WRONG";

export interface AnswerRecord {
  questionId: number;
  status: ResultStatus;
  points: number;
  userAnswer: string;
}

export interface ConfigState {
  count: number;
  dist: { easy: number; medium: number; hard: number };
}

export type ViewState = "landing" | "playing" | "summary" | "admin";
