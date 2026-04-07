import { OpenAIEmbeddings } from '@langchain/openai';
import { getCuratedPapers } from '../knowledge/scientific-database';
import {
  type ScoredPaper,
  computeTrustworthiness,
  computeCombinedScore,
  selectTopK,
  ALPHA,
  TOP_K,
} from '../knowledge/trustworthiness';

// ─── Embeddings Cache ────────────────────────────────────────────────────────

let curatedEmbeddingsCache: { paper: ScoredPaper; vector: number[] }[] | null = null;
let openaiEmbeddings: OpenAIEmbeddings | null = null;

// ─── Semantic Scholar Cache ─────────────────────────────────────────────────

const semanticScholarCache = new Map<string, ScoredPaper[]>();

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Global Request Queue (Self-Throttling) ──────────────────────────────────
// Ensures only one request to Semantic Scholar is in flight at a time
// across all instances of this retrieval function.
let semanticScholarQueue: Promise<unknown> = Promise.resolve();
const MIN_REQUEST_GAP = 3000; // 3 seconds per public API regs
let lastRequestTime = 0;

function getOpenAIEmbeddings(): OpenAIEmbeddings | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiEmbeddings) {
    openaiEmbeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-small' });
  }
  return openaiEmbeddings;
}

/**
 * Build and cache embeddings for the curated golden database.
 */
async function getCuratedEmbeddings(): Promise<{ paper: ScoredPaper; vector: number[] }[] | null> {
  if (curatedEmbeddingsCache) return curatedEmbeddingsCache;

  const embeddings = getOpenAIEmbeddings();
  if (!embeddings) return null;

  try {
    const papers = getCuratedPapers();
    const texts = papers.map(p => paperToEmbeddingText(p));
    const vectors = await embeddings.embedDocuments(texts);

    curatedEmbeddingsCache = papers.map((paper, i) => ({
      paper,
      vector: vectors[i],
    }));

    return curatedEmbeddingsCache;
  } catch (err) {
    console.warn('[RAG] Не удалось создать embeddings для золотой базы:', err);
    return null;
  }
}

// ─── Semantic Scholar API ────────────────────────────────────────────────────

interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string | null;
  authors: { name: string }[];
  year: number | null;
  citationCount: number;
  influentialCitationCount: number;
  venue: string;
  fieldsOfStudy: string[] | null;
}

/**
 * Search Semantic Scholar for papers relevant to the query.
 * Returns up to `limit` papers with full metadata for trustworthiness scoring.
 * Includes in-memory caching and retry logic for rate limiting (429).
 */
async function searchSemanticScholar(query: string, limit: number = 20): Promise<ScoredPaper[]> {
  // 0. Normalize query for better cache hits
  const cleanQuery = query
    .toLowerCase()
    .trim()
    .substring(0, 150)
    .replace(/[.,!?"""]/g, '');
  const cacheKey = `${cleanQuery}_${limit}`;

  // 1. Check cache
  if (semanticScholarCache.has(cacheKey)) {
    console.log(`[SemanticScholar] Cache HIT for: "${cleanQuery}"`);
    return semanticScholarCache.get(cacheKey)!;
  }

  const fields = 'title,abstract,authors,year,citationCount,influentialCitationCount,venue,fieldsOfStudy';
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(cleanQuery)}&limit=${limit}&fields=${fields}`;

  const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;

  // 2. Queue the request to enforce staggering
  const queued = semanticScholarQueue.then(async () => {
    let retries = 0;
    const maxRetries = 2;
    let backoff = 4000; // Start with 4s backoff (safer for public API)

    while (retries <= maxRetries) {
      try {
        // Enforce staggering if the last request was too recent
        const now = Date.now();
        const timeSinceLast = now - lastRequestTime;
        if (timeSinceLast < MIN_REQUEST_GAP && !apiKey) {
          const waitTime = MIN_REQUEST_GAP - timeSinceLast;
          console.log(`[SemanticScholar] Staggering request. Waiting ${waitTime}ms...`);
          await delay(waitTime);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s

        const headers: Record<string, string> = {
          'Accept': 'application/json',
        };
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }

        const res = await fetch(url, {
          signal: controller.signal,
          headers,
        });
        clearTimeout(timeoutId);
        lastRequestTime = Date.now();

        if (res.status === 429) {
          if (retries < maxRetries) {
            retries++;
            console.warn(`[SemanticScholar] 429 Rate Limit. Retrying in ${backoff / 1000}s... (Attempt ${retries}/${maxRetries})`);
            await delay(backoff);
            backoff *= 2; 
            continue;
          } else {
            console.error('[SemanticScholar] 429 Rate Limit. Max retries reached.');
            return [];
          }
        }

      if (!res.ok) {
        console.warn(`[SemanticScholar] API returned ${res.status}: ${res.statusText}`);
        return [];
      }

      const data = await res.json();
      if (!data.data || data.data.length === 0) return [];

      // Convert to ScoredPaper and compute trustworthiness
      const papers: ScoredPaper[] = data.data
        .filter((p: SemanticScholarPaper) => p.abstract) // Skip papers without abstracts
        .map((p: SemanticScholarPaper): ScoredPaper => {
          const paperBase = {
            id: `ss_${p.paperId}`,
            title: p.title || 'Untitled',
            authors: p.authors?.map(a => a.name).join(', ') || 'Unknown',
            year: p.year || new Date().getFullYear(),
            abstract: p.abstract || '',
            citationCount: p.citationCount || 0,
            influentialCitationCount: p.influentialCitationCount || 0,
            venue: p.venue || '',
            source: 'semantic_scholar' as const,
          };

          return {
            ...paperBase,
            trustworthiness: computeTrustworthiness(paperBase),
            cosineSimilarity: 0,
            combinedScore: 0,
          };
        });

      // 2. Store in cache
      semanticScholarCache.set(cacheKey, papers);
      return papers;

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('[SemanticScholar] Request timed out.');
      } else {
        console.error('[SemanticScholar] Search failed:', err);
      }
      return [];
    }
  }
  return [];
});
  semanticScholarQueue = queued;
  return queued;
}

// ─── Vector Math ─────────────────────────────────────────────────────────────

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

function paperToEmbeddingText(p: ScoredPaper): string {
  const parts = [p.title];
  if (p.conceptName) parts.push(p.conceptName);
  if (p.abstract) parts.push(p.abstract);
  if (p.keyFinding) parts.push(p.keyFinding);
  if (p.applicationToAnxiety) parts.push(p.applicationToAnxiety);
  return parts.join('. ');
}

// ─── Fallback (no OpenAI key) ────────────────────────────────────────────────

function fallbackKeywordScore(paper: ScoredPaper, keywords: string[]): number {
  const text = paperToEmbeddingText(paper).toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) score += 1;
  }
  // Normalize to [0, 1] range
  return keywords.length > 0 ? Math.min(1, score / Math.max(keywords.length * 0.4, 1)) : 0;
}

// ─── Main Pipeline ──────────────────────────────────────────────────────────

/**
 * Retrieve scientific context using trustworthiness-weighted KNN.
 * 
 * Pipeline:
 * 1. Embed the query
 * 2. Build candidate pool: curated golden DB + live Semantic Scholar results
 * 3. Compute cosine similarity for each candidate
 * 4. Compute combined score = α·similarity + (1-α)·trustworthiness
 * 5. Select top-K papers
 * 6. Format for LLM prompt with [TRUST: X.XX] markers
 */
export async function retrieveScientificContext(myth: string): Promise<string> {
  const embeddings = getOpenAIEmbeddings();

  // ── Step 1: Build candidate pools in parallel ──
  const [curatedCache, livePapers] = await Promise.all([
    getCuratedEmbeddings(),
    searchSemanticScholar(myth, 20),
  ]);

  // ── Step 2: Score all candidates ──
  let allCandidates: ScoredPaper[] = [];

  if (embeddings) {
    try {
      const queryVector = await embeddings.embedQuery(myth);

      // Score curated papers
      if (curatedCache) {
        for (const { paper, vector } of curatedCache) {
          const sim = cosineSimilarity(queryVector, vector);
          allCandidates.push({
            ...paper,
            cosineSimilarity: sim,
            combinedScore: computeCombinedScore(sim, paper.trustworthiness, ALPHA),
          });
        }
      }

      // Score live papers (need to embed them first)
      if (livePapers.length > 0) {
        const liveTexts = livePapers.map(paperToEmbeddingText);
        const liveVectors = await embeddings.embedDocuments(liveTexts);

        for (let i = 0; i < livePapers.length; i++) {
          const sim = cosineSimilarity(queryVector, liveVectors[i]);
          livePapers[i].cosineSimilarity = sim;
          livePapers[i].combinedScore = computeCombinedScore(sim, livePapers[i].trustworthiness, ALPHA);
          allCandidates.push(livePapers[i]);
        }
      }
    } catch (err) {
      console.error('[RAG] Ошибка вычисления embeddings, используем keyword fallback:', err);
      allCandidates = buildFallbackCandidates(myth, livePapers);
    }
  } else {
    // No OpenAI key — keyword fallback
    allCandidates = buildFallbackCandidates(myth, livePapers);
  }

  // ── Step 3: Select top-K by combined score ──
  const topPapers = selectTopK(allCandidates, TOP_K);

  if (topPapers.length === 0) {
    return '[Научный контекст недоступен. Используй общие знания.]';
  }

  // ── Step 4: Format for LLM ──
  return topPapers.map(formatPaperForLLM).join('\n\n---\n\n');
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFallbackCandidates(myth: string, livePapers: ScoredPaper[]): ScoredPaper[] {
  const keywords = myth.toLowerCase().replace(/[.,!?]/g, '').split(' ').filter(w => w.length > 3);
  const curated = getCuratedPapers();

  const all = [...curated, ...livePapers];
  for (const paper of all) {
    const sim = fallbackKeywordScore(paper, keywords) + Math.random() * 0.01; // tie-breaker
    paper.cosineSimilarity = sim;
    paper.combinedScore = computeCombinedScore(sim, paper.trustworthiness, ALPHA);
  }

  return all;
}

function formatPaperForLLM(paper: ScoredPaper): string {
  const sourceTag = paper.source === 'curated' ? 'ПРОВЕРЕННОЕ ИССЛЕДОВАНИЕ' : 'АКТУАЛЬНАЯ НАУКА';
  const trustTag = `[TRUST: ${paper.trustworthiness.toFixed(2)}]`;

  const lines = [
    `[${sourceTag}] ${trustTag}`,
    `Концепт: ${paper.conceptName || paper.title}`,
    `Исследование: ${paper.authors} — "${paper.title}"`,
  ];

  if (paper.methodology) {
    lines.push(`Методология: ${paper.methodology}`);
  }

  if (paper.keyFinding) {
    lines.push(`Ключевой вывод: ${paper.keyFinding}`);
  } else if (paper.abstract) {
    lines.push(`Abstract: ${paper.abstract.substring(0, 600)}`);
  }

  if (paper.applicationToAnxiety) {
    lines.push(`Применение к тревоге: ${paper.applicationToAnxiety}`);
  }

  if (paper.source === 'semantic_scholar') {
    const meta: string[] = [];
    if (paper.citationCount > 0) meta.push(`${paper.citationCount} цитирований`);
    if (paper.venue) meta.push(`Venue: ${paper.venue}`);
    if (paper.year) meta.push(`Год: ${paper.year}`);
    if (meta.length > 0) lines.push(`Метаданные: ${meta.join(' | ')}`);
  }

  return lines.join('\n');
}
