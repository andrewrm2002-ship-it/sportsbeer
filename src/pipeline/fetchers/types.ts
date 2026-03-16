export interface RawArticleData {
  externalId: string;
  sport: string;
  league?: string;
  title: string;
  description: string;
  category: 'scores' | 'news' | 'stats' | 'highlights';
  sourceUrl?: string;
  sourceName: string;
  imageUrl?: string;
  teams?: string[];
  scores?: { home: string; away: string; homeScore: number; awayScore: number };
  venue?: string;
  players?: string[];
  publishedAt: Date;
  rawData: Record<string, unknown>;
}

export interface SportConfig {
  id: string;
  name: string;
  slug: string;
  espnSlug: string | null;
  sportsDbId: string | null;
  isActive: boolean;
}

export interface FetchResult {
  sport: string;
  articles: RawArticleData[];
  errors: string[];
}
