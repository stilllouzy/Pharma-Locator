// Shared search-intent detection — used by Home.tsx (on submit) and Results.tsx.

const NEAREST_KEYWORDS = ["near me", "nearby", "nearest"];

export function isNearestQuery(query: string): boolean {
  const lower = query.trim().toLowerCase();
  return NEAREST_KEYWORDS.some((kw) => lower.includes(kw));
}