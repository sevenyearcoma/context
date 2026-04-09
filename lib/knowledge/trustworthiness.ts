/**
 * Trustworthiness Scoring Engine
 * 
 * Computes a trustworthiness score for scientific papers based on 4 signals:
 * - Citation Impact (log-scaled citation count)
 * - Influential Ratio (% of citations marked "influential" by S2)
 * - Venue Quality (known journals/conferences mapped to quality tiers)
 * - Recency (newer papers score higher, 30+ year old papers → 0)
 * 
 * Combined with cosine similarity via: combinedScore = α·similarity + (1-α)·trustworthiness
 */

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ScoredPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  abstract: string;
  methodology?: string;
  keyFinding?: string;
  applicationToAnxiety?: string;
  conceptName?: string;

  // Trustworthiness metadata
  citationCount: number;
  influentialCitationCount: number;
  venue: string;
  source: 'curated' | 'semantic_scholar';

  // Computed scores (filled during ranking)
  trustworthiness: number;
  cosineSimilarity: number;
  combinedScore: number;
}

// ─── Config ──────────────────────────────────────────────────────────────────

/** Weights for trustworthiness sub-signals (must sum to 1.0) */
const TRUST_WEIGHTS = {
  citationImpact: 0.35,
  influentialRatio: 0.25,
  venueQuality: 0.20,
  recency: 0.20,
} as const;

/** Balance between semantic similarity and trustworthiness in final ranking.
 *
 * combinedScore = α·similarity + (1-α)·trustworthiness
 *
 * α = 0.1 (old): trustworthiness dominates; curated papers (trust=1.0) always win
 *   regardless of relevance — semantic search never surfaces.
 * α = 0.5 (new): equal weight; a live paper with cos=0.7 and trust=0.5 scores 0.60,
 *   beating a curated paper that happens to be off-topic (cos=0.1 → score 0.55).
 *   Curated papers still win when equally relevant due to trust advantage.
 */
export const ALPHA = 0.9;

/** Number of papers to select for the final context */
export const TOP_K = 5;

// ─── Venue Quality Map ──────────────────────────────────────────────────────

/**
 * Known venues mapped to quality scores [0, 1].
 * This covers major psychology, neuroscience, and general science venues.
 * Papers from unknown venues get a default score via heuristic.
 */
const VENUE_QUALITY_MAP: Record<string, number> = {
  // Top-tier general science
  'nature': 1.0,
  'science': 1.0,
  'proceedings of the national academy of sciences': 0.95,
  'pnas': 0.95,
  'the lancet': 0.95,
  'cell': 0.95,

  // Psychology & psychiatry flagships
  'psychological bulletin': 0.95,
  'psychological review': 0.95,
  'annual review of psychology': 0.95,
  'american psychologist': 0.90,
  'journal of personality and social psychology': 0.90,
  'psychological science': 0.90,
  'jama psychiatry': 0.90,
  'the american journal of psychiatry': 0.90,
  'clinical psychology review': 0.88,
  'journal of abnormal psychology': 0.85,
  'journal of consulting and clinical psychology': 0.85,
  'behaviour research and therapy': 0.85,
  'journal of anxiety disorders': 0.82,
  'cognitive therapy and research': 0.80,
  'journal of cognitive neuroscience': 0.85,
  'social cognitive and affective neuroscience': 0.82,
  'frontiers in psychology': 0.70,
  'frontiers in psychiatry': 0.70,
  'plos one': 0.60,

  // Neuroscience
  'nature neuroscience': 0.95,
  'neuron': 0.93,
  'journal of neuroscience': 0.88,
  'neuroimage': 0.82,
  'biological psychiatry': 0.88,

  // Meta-analysis / Cochrane
  'cochrane database of systematic reviews': 0.98,

  // Education / ADHD
  'journal of attention disorders': 0.75,
  'journal of child psychology and psychiatry': 0.85,
};

// ─── Core Functions ─────────────────────────────────────────────────────────

/**
 * Compute trustworthiness score for a paper.
 * Returns a value in [0, 1].
 * 
 * Curated papers (source: 'curated') always get 1.0.
 */
export function computeTrustworthiness(paper: Omit<ScoredPaper, 'trustworthiness' | 'cosineSimilarity' | 'combinedScore'>): number {
  // Golden database items are maximally trusted
  if (paper.source === 'curated') return 1.0;

  const currentYear = new Date().getFullYear();

  // 1. Citation Impact: log-scaled, caps at ~10,000 citations
  const citationImpact = Math.min(1, Math.log10(paper.citationCount + 1) / 4);

  // 2. Influential Ratio: what fraction of citations are "influential"
  const influentialRatio = paper.citationCount > 0
    ? Math.min(1, paper.influentialCitationCount / paper.citationCount)
    : 0;

  // 3. Venue Quality: lookup or heuristic
  const venueQuality = getVenueQuality(paper.venue);

  // 4. Recency: linear decay over 30 years
  const age = currentYear - (paper.year || currentYear);
  const recency = Math.max(0, Math.min(1, 1 - age / 30));

  // Weighted sum
  const trust =
    TRUST_WEIGHTS.citationImpact * citationImpact +
    TRUST_WEIGHTS.influentialRatio * influentialRatio +
    TRUST_WEIGHTS.venueQuality * venueQuality +
    TRUST_WEIGHTS.recency * recency;

  return Math.round(trust * 100) / 100; // Round to 2 decimals
}

/**
 * Look up venue quality from the map, or apply a heuristic for unknown venues.
 */
function getVenueQuality(venue: string): number {
  if (!venue) return 0.3; // No venue info → low default

  const normalized = venue.toLowerCase().trim();

  // Exact match
  if (VENUE_QUALITY_MAP[normalized] !== undefined) {
    return VENUE_QUALITY_MAP[normalized];
  }

  // Partial match: check if any known venue is a substring
  for (const [knownVenue, score] of Object.entries(VENUE_QUALITY_MAP)) {
    if (normalized.includes(knownVenue) || knownVenue.includes(normalized)) {
      return score;
    }
  }

  // Heuristic for unknown venues
  if (normalized.includes('journal') || normalized.includes('review')) return 0.55;
  if (normalized.includes('proceedings') || normalized.includes('conference')) return 0.50;
  if (normalized.includes('frontiers')) return 0.65;
  if (normalized.includes('arxiv') || normalized.includes('preprint')) return 0.25;

  return 0.40; // Unknown venue default
}

/**
 * Compute the combined score that blends semantic similarity with trustworthiness.
 * 
 * combinedScore = α × cosineSimilarity + (1 - α) × trustworthiness
 * 
 * This allows high-trust papers to surface even when cosine similarity is moderate.
 */
export function computeCombinedScore(
  cosineSimilarity: number,
  trustworthiness: number,
  alpha: number = ALPHA
): number {
  const score = alpha * cosineSimilarity + (1 - alpha) * trustworthiness;
  return Math.round(score * 1000) / 1000; // Round to 3 decimals
}

/**
 * Rank a pool of ScoredPapers by combined score and return top-K.
 */
export function selectTopK(papers: ScoredPaper[], k: number = TOP_K): ScoredPaper[] {
  return [...papers]
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, k);
}
