/**
 * Main rewriting engine.
 * Takes raw sports data and transforms it into humorous, beer-themed articles.
 */

import type { RawArticleData } from '../fetchers/types';
import {
  type TemplateData,
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
  pickTemplate,
  pickTemplates,
} from './templates';
import {
  beerTransitions,
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

// ─── Sentence Helpers ────────────────────────────────────────────────────────

function splitIntoSentences(text: string): string[] {
  // Strip HTML and split on sentence boundaries, keeping the content
  return text
    .replace(/<[^>]*>/g, '')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10); // Filter out tiny fragments
}

function rewriteSentenceWithHumor(sentence: string, _facts: ExtractedFacts): string {
  // Safely lowercase first char only if it's a regular word (not an acronym or proper noun starting with caps)
  const lowerFirst = (s: string) => {
    // Don't lowercase if starts with acronym pattern (e.g., "U.S.", "NBA", "NFL") or number
    if (/^[A-Z]{2}|^[A-Z]\./.test(s)) return s;
    return s.charAt(0).toLowerCase() + s.slice(1);
  };

  const patterns: Array<(s: string) => string> = [
    // Lead with the fact, add commentary after
    (s) => `${s} ${getQuickCommentary()}`,
    // Add a humorous lead-in before the fact
    (s) => `In what can only be described as a "hold my beer" moment, ${lowerFirst(s)}`,
    // Wrap fact in reaction
    (s) => `Here's what happened: ${s} Yeah, we had to read that twice too.`,
    // Casual retelling
    (s) => `So get this — ${lowerFirst(s)}`,
    // Sports bar commentary
    (s) => `The headlines are in, and they're a doozy: ${s}`,
    // Direct with humor tag
    (s) => `${s} If you need a moment to process that, we'll wait. We've got beer.`,
    // Straight delivery for variety (not everything needs a joke)
    (s) => s,
    // Storytelling voice
    (s) => `Picture this: ${lowerFirst(s)} You can't make this stuff up.`,
  ];

  return patterns[Math.floor(Math.random() * patterns.length)]!(sentence);
}

function getQuickCommentary(): string {
  const options = [
    'Let that sink in.',
    "We'll pause while you process that.",
    'Read that again if you need to.',
    "And no, we're not making this up.",
    'Cheers to that.',
    "File that under 'things that actually happened.'",
    'Moving on.',
    "But wait, there's more.",
    'Drink accordingly.',
    'The bar goes wild.',
  ];
  return options[Math.floor(Math.random() * options.length)]!;
}

// ─── Body Builder ───────────────────────────────────────────────────────────

function buildScoreBody(facts: ExtractedFacts, templateData: TemplateData): string {
  const scoreTemplates = getScoreTemplates(facts);
  const mainRecap = pickTemplate(scoreTemplates)(templateData);
  const sentiment = getSentiment(facts);
  const bodyDetails = pickTemplates(bodyParagraphTemplates, 2 + Math.floor(Math.random() * 2));
  const puns = randomPuns(facts.sport, 2);

  // Structural variants — pick one randomly for diversity
  const variant = Math.floor(Math.random() * 4);

  const paragraphs: string[] = [];

  switch (variant) {
    case 0: {
      // Classic: opening -> recap -> transition -> details -> pun -> sentiment -> closing
      paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);
      paragraphs.push(`<p>${mainRecap}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
      for (const tmpl of bodyDetails) {
        paragraphs.push(`<p>${tmpl(templateData)}</p>`);
        if (Math.random() > 0.5) {
          paragraphs.push(`<p><em>${randomPhrase(humorInterjections)}</em></p>`);
        }
      }
      paragraphs.push(`<p>${puns[0]}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(sentiment)}</strong></p>`);
      paragraphs.push(`<p>${randomPhrase(beerTransitions)}</p>`);
      paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);
      break;
    }
    case 1: {
      // No opening transition — jump straight into the recap, double puns
      paragraphs.push(`<p>${mainRecap}</p>`);
      paragraphs.push(`<p><em>${randomPhrase(humorInterjections)}</em></p>`);
      for (const tmpl of bodyDetails) {
        paragraphs.push(`<p>${tmpl(templateData)}</p>`);
      }
      paragraphs.push(`<p>${puns[0]}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
      if (puns[1]) paragraphs.push(`<p>${puns[1]}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(sentiment)}</strong></p>`);
      paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);
      break;
    }
    case 2: {
      // Interjection-heavy: opening -> recap -> interjection -> details interleaved with interjections
      paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);
      paragraphs.push(`<p>${mainRecap}</p>`);
      paragraphs.push(`<p><em>${randomPhrase(humorInterjections)}</em></p>`);
      paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
      for (const tmpl of bodyDetails) {
        paragraphs.push(`<p>${tmpl(templateData)}</p>`);
        paragraphs.push(`<p><em>${randomPhrase(humorInterjections)}</em></p>`);
      }
      paragraphs.push(`<p>${puns[0]}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(sentiment)}</strong></p>`);
      paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);
      break;
    }
    case 3:
    default: {
      // Sentiment-first: opening -> sentiment -> recap -> transition -> short details -> pun -> closing
      paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(sentiment)}</strong></p>`);
      paragraphs.push(`<p>${mainRecap}</p>`);
      paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
      const shortDetails = bodyDetails.slice(0, 2);
      for (const tmpl of shortDetails) {
        paragraphs.push(`<p>${tmpl(templateData)}</p>`);
      }
      paragraphs.push(`<p>${puns[0]}</p>`);
      paragraphs.push(`<p>${randomPhrase(beerTransitions)}</p>`);
      paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);
      break;
    }
  }

  // Add the actual game details rewritten with humor
  if (facts.description && facts.description.length > 20) {
    const descSentences = splitIntoSentences(facts.description);
    for (const sentence of descSentences) {
      paragraphs.push(`<p>${rewriteSentenceWithHumor(sentence, facts)}</p>`);
    }
  }

  return paragraphs.join('\n');
}

function buildNewsBody(facts: ExtractedFacts, templateData: TemplateData): string {
  const paragraphs: string[] = [];
  const description = facts.description || '';

  // Opening with humor
  paragraphs.push(`<p>${randomPhrase(openingLines)}</p>`);

  // Break the real description into sentences and rewrite each with humor
  const sentences = splitIntoSentences(description);

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i]!.trim();
    if (!sentence) continue;

    // Rewrite the fact with humorous framing
    const rewritten = rewriteSentenceWithHumor(sentence, facts);
    paragraphs.push(`<p>${rewritten}</p>`);

    // Add humor between paragraphs (not after every one)
    if (i < sentences.length - 1 && Math.random() > 0.5) {
      const roll = Math.random();
      if (roll < 0.33) {
        paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
      } else if (roll < 0.66) {
        paragraphs.push(`<p><em>${randomPhrase(humorInterjections)}</em></p>`);
      }
    }
  }

  // If description was too short, add more context (but don't repeat the description)
  if (sentences.length < 2) {
    paragraphs.push(`<p><strong>${randomPhrase(beerTransitions)}</strong></p>`);
    paragraphs.push(`<p>We'll keep an eye on this story as it develops. For now, ${facts.sport ? `the ${facts.sport} world` : 'the sports world'} has plenty to talk about.</p>`);
  }

  // Sport pun
  paragraphs.push(`<p>${randomPun(facts.sport)}</p>`);

  // Closing
  paragraphs.push(`<p><em>${randomPhrase(closingLines)}</em></p>`);

  return paragraphs.join('\n');
}

// ─── Summary Builder ────────────────────────────────────────────────────────

function buildSummary(facts: ExtractedFacts): string {
  const parts: string[] = [];

  // Use the real description as the factual base
  if (facts.description && facts.description.length > 20) {
    // Take the first sentence of the real description
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

  parts.push(randomPhrase(beerTransitions));

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
    );
  } else if (facts.isCloseGame) {
    options.push(
      `A thriller that required multiple beverages to survive`,
      `Cardiac arrest: the game`,
      `${facts.winner ?? 'The winners'} escape by the skin of their teeth`,
    );
  } else if (facts.isDraw) {
    options.push(
      `Nobody wins, everybody drinks`,
      `A stalemate that satisfied absolutely no one`,
      `Split the points, split a pitcher`,
    );
  } else if (facts.category === 'news') {
    options.push(
      `Grab a drink and settle in`,
      `The latest from the world of ${facts.sport ?? 'sports'}`,
      `Breaking news best served with a cold one`,
    );
  } else {
    options.push(
      `Your ${facts.sport ?? 'sports'} recap, served fresh`,
      `All the action, none of the sobriety`,
      `The only recap worth reading with a beer in hand`,
    );
  }

  return options[Math.floor(Math.random() * options.length)]!;
}

// ─── Main Rewrite Function ──────────────────────────────────────────────────

/**
 * Rewrite a raw article into a humorous, beer-themed version.
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
