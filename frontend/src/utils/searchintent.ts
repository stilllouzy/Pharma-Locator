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