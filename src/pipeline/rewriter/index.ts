/**
 * Main rewriting engine.
 * Takes raw sports data and transforms it into witty, well-written articles
 * with occasional beer/bar references that feel natural.
 */

import type { RawArticleData } from '../fetchers/types';
import {
  type TemplateData,
  type TemplateFn,
  gameRecapTemplates,
  blowoutTemplates,
  closeGameTemplates,
  upsetTemplates,
  drawTemplates,
  transferTemplates,
  injuryTemplates,
  retirementTemplates,
  suspensionTemplates,
  generalNewsTemplates,
  standingsTemplates,
  bodyParagraphTemplates,
  analysisParagraphs,
  contextParagraphs,
  playerFocusParagraphs,
  pickTemplate,
  pickTemplates,
} from './templates';
import {
  beerTransitions,
  wittyTransitions,
  generalHumorTransitions,
  allTransitions,
  wittyCommentary,
  contextualReactions,
  humorInterjections,
  openingLines,
  closingLines,
  sentimentPhrases,
  randomPhrase,
  randomPhrases,
} from './phrases';
import { randomPun, randomPuns } from './sports-puns';
import { generateHeadline, categorizeScore, type HeadlineCategory } from './headlines';

export interface RewrittenArticle {
  title: string;
  subtitle: string;
  body: string;
  summary: string;
}

// ─── Fact Extraction ────────────────────────────────────────────────────────

interface ExtractedFacts {
  winner?: string;
  loser?: string;
  home?: string;
  away?: string;
  homeScore?: number;
  awayScore?: number;
  score?: string;
  scoreDiff?: number;
  isBlowout: boolean;
  isCloseGame: boolean;
  isDraw: boolean;
  isUpset: boolean;
  teams: string[];
  sport: string;
  league?: string;
  description: string;
  category: string;
}

function extractFacts(raw: RawArticleData): ExtractedFacts {
  const teams = raw.teams ?? [];
  const scores = raw.scores;
  let winner: string | undefined;
  let loser: string | undefined;
  let homeScore: number | undefined;
  let awayScore: number | undefined;
  let scoreDiff = 0;
  let isBlowout = false;
  let isCloseGame = false;
  let isDraw = false;
  let isUpset = false;
  let scoreStr: string | undefined;

  if (scores) {
    homeScore = scores.homeScore;
    awayScore = scores.awayScore;
    scoreDiff = Math.abs(homeScore - awayScore);
    const total = homeScore + awayScore;

    if (homeScore === awayScore) {
      isDraw = true;
      winner = scores.home;
      loser = scores.away;
    } else {
      winner = homeScore > awayScore ? scores.home : scores.away;
      loser = homeScore > awayScore ? scores.away : scores.home;

      if (total > 0) {
        isBlowout = scoreDiff / total > 0.4;
        isCloseGame = scoreDiff <= 1 || scoreDiff / total < 0.1;
      }

      // Upset heuristic: large margin (>10 pts) and the away team won
      if (scoreDiff > 10 && awayScore > homeScore) {
        isUpset = true;
      }
    }

    scoreStr = `${homeScore}-${awayScore}`;
  }

  return {
    winner,
    loser,
    home: scores?.home ?? teams[0],
    away: scores?.away ?? teams[1],
    homeScore,
    awayScore,
    score: scoreStr,
    scoreDiff,
    isBlowout,
    isCloseGame,
    isDraw,
    isUpset,
    teams,
    sport: raw.sport,
    league: raw.league,
    description: raw.description,
    category: raw.category,
  };
}

// ─── Template Selection ─────────────────────────────────────────────────────

function getScoreTemplates(facts: ExtractedFacts) {
  if (facts.isDraw) return drawTemplates;
  if (facts.isUpset) return upsetTemplates;
  if (facts.isBlowout) return blowoutTemplates;
  if (facts.isCloseGame) return closeGameTemplates;
  return gameRecapTemplates;
}

function getSentiment(facts: ExtractedFacts): readonly string[] {
  if (facts.isDraw) return sentimentPhrases.closeWin;
  if (facts.isUpset) return sentimentPhrases.upset;

  // Randomly alternate perspective between winner, loser, and category-specific
  const roll = Math.random();
  if (facts.isBlowout) {
    return roll < 0.6 ? sentimentPhrases.bigWin : sentimentPhrases.loss;
  }
  if (facts.isCloseGame) {
    return roll < 0.5 ? sentimentPhrases.closeWin : sentimentPhrases.loss;
  }

  // General game — rotate among bigWin, closeWin, loss
  if (roll < 0.4) return sentimentPhrases.bigWin;
  if (roll < 0.7) return sentimentPhrases.closeWin;
  return sentimentPhrases.loss;
}

function getHeadlineCategory(facts: ExtractedFacts): HeadlineCategory {
  if (facts.category === 'news') return 'news';
  if (facts.isDraw) return 'draw';
  if (facts.isUpset) return 'upset';
  if (facts.homeScore !== undefined && facts.awayScore !== undefined) {
    return categorizeScore(facts.homeScore, facts.awayScore);
  }
  return 'general_score';
}

function detectNewsType(description: string): 'transfer' | 'injury' | 'retirement' | 'suspension' | 'general' {
  const lower = description.toLowerCase();
  if (lower.includes('trade') || lower.includes('transfer') || lower.includes('sign') || lower.includes('acquire')) {
    return 'transfer';
  }
  if (lower.includes('injur') || lower.includes('hurt') || lower.includes('sideline') || lower.includes('out for')) {
    return 'injury';
  }
  if (lower.includes('retire') || lower.includes('hang up') || lower.includes('calls it')) {
    return 'retirement';
  }
  if (lower.includes('suspend') || lower.includes('ban') || lower.includes('fine')) {
    return 'suspension';
  }
  return 'general';
}

function getNewsTemplates(description: string) {
  const type = detectNewsType(description);
  switch (type) {
    case 'transfer':
      return transferTemplates;
    case 'injury':
      return injuryTemplates;
    case 'retirement':
      return retirementTemplates;
    case 'suspension':
      return suspensionTemplates;
    default:
      return generalNewsTemplates;
  }
}

// ─── Contextual Reaction Selection ──────────────────────────────────────────

function getContextualReaction(facts: ExtractedFacts): string {
  if (facts.isBlowout) return randomPhrase(contextualReactions.dominant);
  if (facts.isUpset) return randomPhrase(contextualReactions.historic);
  if (facts.isCloseGame) return randomPhrase(contextualReactions.comeback);
  // Default to a dominant reaction for general wins
  return randomPhrase(contextualReactions.dominant);
}

// ─── Sentence Helpers ────────────────────────────────────────────────────────

function splitIntoSentences(text: string): string[] {
  // Strip HTML and split on sentence boundaries, keeping the content
  return text
    .replace(/<[^>]*>/g, '')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10); // Filter out tiny fragments
}

/**
 * Rewrite a sentence with varying levels of humor treatment.
 * 60% straight delivery, 25% light humor, 15% full humor.
 */
function rewriteSentenceWithHumor(sentence: string, _facts: ExtractedFacts): string {
  const lowerFirst = (s: string) => {
    if (/^[A-Z]{2}|^[A-Z]\./.test(s)) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  };

  const roll = Math.random();

  // 60% — straight delivery (just the fact, no wrapping)
  if (roll < 0.60) {
    return sentence;
  }

  // 25% — light humor (subtle commentary)
  if (roll < 0.85) {
    const lightPatterns: Array<(s: string) => string> = [
      (s) => `${s} ${getQuickCommentary()}`,
      (s) => `So get this — ${lowerFirst(s)}`,
      (s) => `${s} You read that correctly.`,
      (s) => `Here's what happened: ${s}`,
      (s) => `The headlines are in: ${s}`,
      (s) => `Worth noting: ${lowerFirst(s)}`,
      (s) => `And then this happened: ${lowerFirst(s)}`,
    ];
    return lightPatterns[Math.floor(Math.random() * lightPatterns.length)]!(sentence);
  }

  // 15% — full humor treatment (only for genuinely notable facts)
  const fullPatterns: Array<(s: string) => string> = [
    (s) => `In what can only be described as a "hold my beer" moment, ${lowerFirst(s)}`,
    (s) => `Picture this: ${lowerFirst(s)} You can't make this stuff up.`,
    (s) => `${s} If you need a moment to process that, we'll wait.`,
    (s) => `We're going to need you to sit down for this one: ${lowerFirst(s)}`,
    (s) => `${s} Yeah, we had to read that twice too.`,
  ];
  return fullPatterns[Math.floor(Math.random() * fullPatterns.length)]!(sentence);
}

function getQuickCommentary(): string {
  const options = [
    'Let that sink in.',
    "We'll pause while you process that.",
    'Read that again if you need to.',
    "And no, we're not making this up.",
    "File that under 'things that actually happened.'",
    'Moving on.',
    "But wait, there's more.",
    "That's not a typo.",
    "Yes, really.",
    "Take a moment.",
  ];
  return options[Math.floor(Math.random() * options.length)]!;
}

/**
 * Pick a transition — only uses beer transitions ~25% of the time.
 * The rest are witty or general humor.
 */
function pickTransition(): string {
  const roll = Math.random();
  if (roll < 0.25) return randomPhrase(beerTransitions);
  if (roll < 0.60) return randomPhrase(wittyTransitions);
  return randomPhrase(generalHumorTransitions);
}

// ─── Body Builder ───────────────────────────────────────────────────────────

function buildScoreBody(facts: ExtractedFacts, templateData: TemplateData): string {
  const scoreTemplates = getScoreTemplates(facts);
  const mainRecap = pickTemplate(scoreTemplates)(templateData);
  const sentiment = getSentiment(facts);
  const bodyDetails = pickTemplates(bodyParagraphTemplates, 2 + Math.floor(Math.random() * 2));
  const analysisParas = pickTemplates(analysisParagraphs, 1 + Math.floor(Math.random() * 2));
  const contextParas = pickTemplates(contextParagraphs, 1);
  const playerParas = templateData.player ? pickTemplates(playerFocusParagraphs, 1) : [];
  const puns = randomPuns(facts.sport, 1);

  const paragraphs: string[] = [];

  // ── 1. Opening (1 paragraph) ──────────────────────────────────────────────
  paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);

  // ── 2. Main recap (1 paragraph) ───────────────────────────────────────────
  paragraphs.push(`<p>${mainRecap}</p>`);

  // ── 3. Game narrative from real description (2-3 paragraphs) ──────────────
  if (facts.description && facts.description.length > 20) {
    const descSentences = splitIntoSentences(facts.description);
    if (descSentences.length > 0) {
      // Group sentences into paragraphs of 2-3 sentences each
      const sentenceGroups: string[][] = [];
      let currentGroup: string[] = [];
      for (const sentence of descSentences) {
        currentGroup.push(rewriteSentenceWithHumor(sentence, facts));
        if (currentGroup.length >= 2 + Math.floor(Math.random() * 2)) {
          sentenceGroups.push(currentGroup);
          currentGroup = [];
        }
      }
      if (currentGroup.length > 0) sentenceGroups.push(currentGroup);

      for (const group of sentenceGroups) {
        paragraphs.push(`<p>${group.join(' ')}</p>`);
      }
    }
  }

  // ── 4. Body detail paragraphs (1-2 paragraphs of game details) ────────────
  for (const tmpl of bodyDetails.slice(0, 2)) {
    paragraphs.push(`<p>${tmpl(templateData)}</p>`);
  }

  // ── 5. Analysis (1-2 paragraphs of intelligent commentary) ────────────────
  // Add ONE non-beer transition before analysis
  paragraphs.push(`<p>${pickTransition()}</p>`);

  for (const tmpl of analysisParas) {
    paragraphs.push(`<p>${tmpl(templateData)}</p>`);
  }

  // ── 6. Player focus (1 paragraph if player data available) ────────────────
  if (playerParas.length > 0) {
    paragraphs.push(`<p>${playerParas[0]!(templateData)}</p>`);
  }

  // ── 7. Context paragraph (1 paragraph — why this game matters) ────────────
  paragraphs.push(`<p>${contextParas[0]!(templateData)}</p>`);

  // ── 8. Key stat/moment + sentiment (1 paragraph) ─────────────────────────
  const contextualReaction = getContextualReaction(facts);
  paragraphs.push(`<p><strong>${randomPhrase(sentiment)}</strong> ${contextualReaction}</p>`);

  // ── 9. Sport pun sign-off (1 paragraph) ───────────────────────────────────
  if (puns[0]) {
    paragraphs.push(`<p>${puns[0]}</p>`);
  }

  // ── 10. Closing (1 paragraph) ─────────────────────────────────────────────
  paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);

  return paragraphs.join('\n');
}

function buildNewsBody(facts: ExtractedFacts, templateData: TemplateData): string {
  const paragraphs: string[] = [];
  const description = facts.description || '';
  const newsTemplates = getNewsTemplates(description);

  // ── 1. Opening (1 paragraph) ──────────────────────────────────────────────
  paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);

  // ── 2. News template lead (1 paragraph) ───────────────────────────────────
  paragraphs.push(`<p>${pickTemplate(newsTemplates)(templateData)}</p>`);

  // ── 3. Real description as backbone (2-3 paragraphs) ─────────────────────
  const sentences = splitIntoSentences(description);

  if (sentences.length > 0) {
    // Group sentences into natural paragraphs
    const sentenceGroups: string[][] = [];
    let currentGroup: string[] = [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]!.trim();
      if (!sentence) continue;
      currentGroup.push(rewriteSentenceWithHumor(sentence, facts));
      if (currentGroup.length >= 2 + Math.floor(Math.random() * 2)) {
        sentenceGroups.push(currentGroup);
        currentGroup = [];
      }
    }
    if (currentGroup.length > 0) sentenceGroups.push(currentGroup);

    for (const group of sentenceGroups) {
      paragraphs.push(`<p>${group.join(' ')}</p>`);
    }
  }

  // If description was too short, add more context
  if (sentences.length < 2) {
    paragraphs.push(`<p>We'll keep an eye on this story as it develops. For now, ${facts.sport ? `the ${facts.sport} world` : 'the sports world'} has plenty to talk about.</p>`);
  }

  // ── 4. Analysis/context (1-2 paragraphs) ──────────────────────────────────
  const analysisParas = pickTemplates(analysisParagraphs, 1);
  paragraphs.push(`<p>${analysisParas[0]!(templateData)}</p>`);

  // ── 5. ONE beer transition max for news articles ──────────────────────────
  paragraphs.push(`<p>${pickTransition()}</p>`);

  // ── 6. Contextual sport pun — try to match the story ─────────────────────
  paragraphs.push(`<p>${randomPun(facts.sport)}</p>`);

  // ── 7. Witty commentary sign-off ──────────────────────────────────────────
  paragraphs.push(`<p>${randomPhrase(wittyCommentary)}</p>`);

  // ── 8. Closing ────────────────────────────────────────────────────────────
  paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);

  return paragraphs.join('\n');
}

// ─── Summary Builder ────────────────────────────────────────────────────────

/**
 * Build a 2-3 sentence summary.
 * Sentence 1: factual summary. Sentence 2: witty one-liner (not necessarily beer-themed).
 */
function buildSummary(facts: ExtractedFacts): string {
  const parts: string[] = [];

  // Sentence 1: factual summary
  if (facts.description && facts.description.length > 20) {
    const firstSentence = facts.description.replace(/<[^>]*>/g, '').split(/[.!?]/)[0];
    if (firstSentence && firstSentence.trim().length > 10) {
      parts.push(firstSentence.trim() + '.');
    }
  } else if (facts.winner && facts.loser && facts.score) {
    if (facts.isDraw) {
      parts.push(`${facts.home} and ${facts.away} drew ${facts.score}.`);
    } else {
      parts.push(`${facts.winner} defeated ${facts.loser} ${facts.score}.`);
    }
  }

  // Sentence 2: witty one-liner commentary (not beer-themed)
  parts.push(randomPhrase(wittyCommentary));

  return parts.join(' ');
}

// ─── Subtitle Builder ───────────────────────────────────────────────────────

function buildSubtitle(facts: ExtractedFacts): string {
  const options: string[] = [];

  if (facts.isBlowout) {
    options.push(
      `${facts.winner ?? 'The victors'} leave no survivors`,
      `A demolition in every sense of the word`,
      `${facts.loser ?? 'The losers'} might need therapy after this one`,
      `We're going to need a bigger highlight reel`,
      `This one was over before it started`,
    );
  } else if (facts.isCloseGame) {
    options.push(
      `A thriller that required nerves of steel to survive`,
      `Cardiac arrest: the game`,
      `${facts.winner ?? 'The winners'} escape by the skin of their teeth`,
      `Both teams deserve a vacation after this`,
      `The kind of game that ages you in real time`,
    );
  } else if (facts.isDraw) {
    options.push(
      `A stalemate that satisfied absolutely no one`,
      `Nobody wins, nobody's happy`,
      `Split the points, split opinions`,
      `The most frustrating kind of result`,
    );
  } else if (facts.category === 'news') {
    options.push(
      `You're going to want to sit down for this`,
      `The latest from the world of ${facts.sport ?? 'sports'}`,
      `The sports world won't shut up about this`,
      `Developing story that changes everything`,
      `Buckle up — this is a big one`,
    );
  } else {
    options.push(
      `Your ${facts.sport ?? 'sports'} recap, served fresh`,
      `All the action, all the drama`,
      `The only recap worth reading today`,
      `Everything that happened, and why it matters`,
      `A game that delivered on every promise`,
    );
  }

  return options[Math.floor(Math.random() * options.length)]!;
}

// ─── Main Rewrite Function ──────────────────────────────────────────────────

/**
 * Rewrite a raw article into a witty, well-written version
 * with natural humor and occasional beer/bar references.
 */
export function rewriteArticle(raw: RawArticleData): RewrittenArticle {
  const facts = extractFacts(raw);

  const templateData: TemplateData = {
    winner: facts.winner,
    loser: facts.loser,
    home: facts.home,
    away: facts.away,
    homeScore: facts.homeScore,
    awayScore: facts.awayScore,
    score: facts.score,
    sport: facts.sport,
    league: facts.league,
    description: facts.description,
    team: facts.teams[0],
    venue: raw.venue,
    player: raw.players?.[0],
  };

  const headlineCategory = getHeadlineCategory(facts);

  const title = generateHeadline(
    {
      winner: facts.winner,
      loser: facts.loser,
      score: facts.score,
      sport: facts.sport,
      league: facts.league,
      homeScore: facts.homeScore,
      awayScore: facts.awayScore,
      originalTitle: raw.title, // Pass real headline for news articles
      player: raw.players?.[0],
      team: facts.teams[0],
    },
    headlineCategory,
  );

  const subtitle = buildSubtitle(facts);

  const body =
    facts.category === 'scores' || facts.category === 'highlights'
      ? buildScoreBody(facts, templateData)
      : buildNewsBody(facts, templateData);

  const summary = buildSummary(facts);

  return { title, subtitle, body, summary };
}

/**
 * Rewrite multiple articles, returning results in the same order.
 */
export function rewriteArticles(articles: RawArticleData[]): RewrittenArticle[] {
  return articles.map(rewriteArticle);
}
