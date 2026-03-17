import type { RawArticleData } from '../fetchers/types';

// ─── Writer Types ───────────────────────────────────────────────────────────

export type WriterStyle = 'punchy' | 'storyteller' | 'analyst';

export interface WriterOutput {
  title: string;
  subtitle: string;
  body: string;
  summary: string;
}

export interface WriterVariant {
  style: WriterStyle;
  output: WriterOutput;
  sourceHash: string;
  sourceTitle: string;
}

// ─── Judge Types ────────────────────────────────────────────────────────────

export type JudgeId = 'editor' | 'reader' | 'fact_checker';

export interface JudgeScores {
  humorQuality: number;
  factualAccuracy: number;
  beerIntegration: number;
  readabilityFlow: number;
  headlineQuality: number;
  overallEngagement: number;
}

export interface JudgeResult extends JudgeScores {
  totalScore: number;
  feedback: string;
}

// ─── Optimizer Types ────────────────────────────────────────────────────────

export interface OptimizationResult {
  updatedInstructions: string;
  changesSummary: string;
}

export interface ScoredVariant {
  variant: WriterVariant;
  scores: { judgeId: JudgeId; result: JudgeResult }[];
  avgScore: number;
}

// ─── Round Types ────────────────────────────────────────────────────────────

export interface RoundStats {
  roundNumber: number;
  avgScore: number;
  bestScore: number;
  worstScore: number;
  scoredVariants: ScoredVariant[];
  errors: string[];
}

export interface LoopResult {
  rounds: RoundStats[];
  finalInstructions: string;
  totalStoriesSaved: number;
}

// ─── Progress Types ─────────────────────────────────────────────────────────

export interface AgentProgressEvent {
  round: number;
  phase: 'researching' | 'writing' | 'judging' | 'optimizing' | 'saving' | 'complete';
  message: string;
  avgScore?: number;
}

// ─── Story with source data ─────────────────────────────────────────────────

export interface StoryData {
  raw: RawArticleData;
  hash: string;
}
