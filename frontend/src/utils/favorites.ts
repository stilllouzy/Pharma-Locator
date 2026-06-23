// Shared favorites storage — used by Home.tsx, MapView.tsx, and Favorites.tsx.
// Mirrors the same per-user localStorage pattern as the cart.

export interface IFavoriteMedicine {
  _id: string;
  name: string;
  price: number;
  category: string;
  pharmacyName?: string;
}

export interface IFavoritePharmacy {
  _id: string;
  name: string;
  address: string;
}

interface FavoritesData {
  medicines: IFavoriteMedicine[];
  pharmacies: IFavoritePharmacy[];
}

const EMPTY: FavoritesData = { medicines: [], pharmacies: [] };

function getFavoritesKey(): string | null {
  const userId = localStorage.getItem("userId");
  return userId ? `favorites:${userId}` : null;
}

export function loadFavorites(): FavoritesData {
  const key = getFavoritesKey();
  if (!key) return EMPTY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      medicines: Array.isArray(parsed?.medicines) ? parsed.medicines : [],
      pharmacies: Array.isArray(parsed?.pharmacies) ? parsed.pharmacies : [],
    };
  } catch {
    return EMPTY;
  }
}

function saveFavorites(data: FavoritesData) {
  const key = getFavoritesKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — favorites still work in-memory for this session.
  }
}

export function isMedicineFavorited(id: string): boolean {
  return loadFavorites().medicines.some((m) => m._id === id);
}

export function isPharmacyFavorited(id: string): boolean {
  return loadFavorites().pharmacies.some((p) => p._id === id);
}

export function toggleFavoriteMedicine(medicine: IFavoriteMedicine): FavoritesData {
  const current = loadFavorites();
  const exists = current.medicines.some((m) => m._id === medicine._id);
  const updated: FavoritesData = {
    ...current,
    medicines: exists
      ? current.medicines.filter((m) => m._id !== medicine._id)
      : [...current.medicines, medicine],
  };
  saveFavorites(updated);
  return updated;
}

export function toggleFavoritePharmacy(pharmacy: IFavoritePharmacy): FavoritesData {
  const current = loadFavorites();
  const exists = current.pharmacies.some((p) => p._id === pharmacy._id);
  const updated: FavoritesData = {
    ...current,
    pharmacies: exists
      ? current.pharmacies.filter((p) => p._id !== pharmacy._id)
      : [...current.pharmacies, pharmacy],
  };
  saveFavorites(updated);
  return updated;
}

// Custom event so multiple components (Home, MapView, Favorites page) stay
// in sync if a favorite is toggled in one place while another is mounted.
export const FAVORITES_CHANGED_EVENT = "pl:favorites-changed";

export function notifyFavoritesChanged() {
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}