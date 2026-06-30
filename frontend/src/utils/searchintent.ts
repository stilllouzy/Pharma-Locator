// Shared search-intent detection — used by Home.tsx (on submit) and Results.tsx.

const NEAREST_KEYWORDS = ["near me", "nearby", "nearest"];
const MEDICINE_LIST_KEYWORDS = [
  "medicine",
  "medicines",
  "list of all medicine",
  "list of all medicines",
  "list of medicine",
  "list of medicines",
  "all medicine",
  "all medicines",
];

const PHARMACY_LIST_KEYWORDS = [
  "pharmacy",
  "pharmacies",
  "list of pharmacy",
  "list of pharmacies",
  "list of all pharmacy",
  "list of all pharmacies",
  "all pharmacy",
  "all pharmacies",
];

export function isGenericMedicineQuery(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return MEDICINE_LIST_KEYWORDS.includes(normalized);
}

export function isGenericPharmacyQuery(query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return PHARMACY_LIST_KEYWORDS.includes(normalized);
}

export function isNearestQuery(query: string): boolean {
  const lower = query.trim().toLowerCase();
  return NEAREST_KEYWORDS.some((kw) => lower.includes(kw));
}