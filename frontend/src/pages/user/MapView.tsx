import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../../api/api";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, type Theme } from "@mui/material";
import "./mapPopup.css";
import { toggleFavoritePharmacy, notifyFavoritesChanged, loadFavorites, FAVORITES_CHANGED_EVENT } from "../../utils/favorites";

// Fix Leaflet's default marker icon paths, which break under bundlers like Vite.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface IconDefaultPrototype {
  _getIconUrl?: unknown;
}

delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface IPharmacy {
  _id: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
}

interface MapViewProps {
  onSelectPharmacy: (id: string, name?: string) => void;
  // When set, the map re-centers on this pharmacy and opens its popup
  // automatically — used when arriving from a search result.
  focusPharmacyId?: string | null;
  // When true, finds the closest pharmacy to the user's current location,
  // centers on it, and opens its popup — used for "near me" searches.
  findNearest?: boolean;
}

// Haversine distance in kilometers between two lat/lng points.
function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Imperatively recenters the map — react-leaflet's MapContainer only applies
// `center`/`zoom` props on initial mount, so changes afterward need this.
function MapRecenter({ position, zoom }: { position: [number, number] | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom ?? map.getZoom());
    }
  }, [position, zoom, map]);
  return null;
}

export default function MapView({ onSelectPharmacy, focusPharmacyId, findNearest }: MapViewProps) {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<IPharmacy | null>(null);
  const [recenterTo, setRecenterTo] = useState<[number, number] | null>(null);
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(
    () => new Set(loadFavorites().pharmacies.map((p) => p._id))
  );

  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const popupMaxWidth = isMobile ? 220 : 260;
  const popupMinWidth = isMobile ? 150 : 160;

  // Keep the favorited set in sync with localStorage, including when a
  // favorite is toggled elsewhere (e.g. the Home page chip, the Favorites page).
  useEffect(() => {
    const sync = () => setFavoritedIds(new Set(loadFavorites().pharmacies.map((p) => p._id)));
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
  }, []);

  const handleToggleFavoritePharmacy = (pharmacy: IPharmacy) => {
    toggleFavoritePharmacy({ _id: pharmacy._id, name: pharmacy.name, address: pharmacy.address });
    notifyFavoritesChanged();
    setFavoritedIds(new Set(loadFavorites().pharmacies.map((p) => p._id)));
  };

  // Get the user's current location, falling back silently if denied.
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log("Location permission denied")
    );
  }, []);

  // Fetch pharmacies for map markers.
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const res = await api.get("/pharmacies");
        setPharmacies(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPharmacies();
  }, []);

  // Focus on a specific pharmacy when arriving from a search result.
  useEffect(() => {
    if (!focusPharmacyId || pharmacies.length === 0) return;
    const match = pharmacies.find((p) => p._id === focusPharmacyId);
    if (match) {
      setSelected(match);
      setRecenterTo([match.location.lat, match.location.lng]);
    }
  }, [focusPharmacyId, pharmacies]);

  // Find and focus the nearest pharmacy when arriving from a "near me" search.
  useEffect(() => {
    if (!findNearest || !userLocation || pharmacies.length === 0) return;

    let closest: IPharmacy | null = null;
    let closestDist = Infinity;
    for (const pharmacy of pharmacies) {
      const dist = distanceKm(userLocation, [pharmacy.location.lat, pharmacy.location.lng]);
      if (dist < closestDist) {
        closestDist = dist;
        closest = pharmacy;
      }
    }

    if (closest) {
      setSelected(closest);
      setRecenterTo([closest.location.lat, closest.location.lng]);
      onSelectPharmacy(closest._id, closest.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findNearest, userLocation, pharmacies]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {selected && (
        <button
          type="button"
          onClick={() => handleToggleFavoritePharmacy(selected)}
          aria-label="Toggle favorite pharmacy"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(13,59,110,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.2rem",
            color: "#E0457B",
            padding: 0,
          }}
        >
          {favoritedIds.has(selected._id) ? "♥" : "♡"}
        </button>
      )}
      <MapContainer
        center={userLocation || [14.3294, 120.9367]} // fallback: Dasmariñas
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <MapRecenter position={recenterTo} zoom={16} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userLocation && (
          <Marker position={userLocation}>
            <Popup maxWidth={popupMaxWidth} minWidth={popupMinWidth}>
              <div className="pl-popup">
                <p className="pl-popup__name" style={{ marginBottom: 0 }}>
                  You are here
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {pharmacies.map((pharmacy) => {
          const isSelected = selected?._id === pharmacy._id;
          return (
            <Marker
              key={pharmacy._id}
              position={[pharmacy.location.lat, pharmacy.location.lng]}
              eventHandlers={{
                click: (e) => {
                  // Leaflet's marker <img> can retain focus after a tap, which
                  // conflicts if any overlay later sets aria-hidden on #root.
                  (e.originalEvent?.target as HTMLElement)?.blur?.();
                  setSelected(pharmacy);
                  onSelectPharmacy(pharmacy._id, pharmacy.name);
                },
              }}
            >
              {isSelected && (
                <Popup
                  maxWidth={popupMaxWidth}
                  minWidth={popupMinWidth}
                  eventHandlers={{ remove: () => setSelected(null) }}
                >
                  <div className="pl-popup">
                    <p className="pl-popup__name">{pharmacy.name}</p>
                    <p className="pl-popup__address">{pharmacy.address}</p>

                    <div className="pl-popup__actions">
                      <button
                        type="button"
                        className="pl-popup__button"
                        onClick={() => {
                          onSelectPharmacy(pharmacy._id, pharmacy.name);
                          navigate(`/user?pharmacy=${pharmacy._id}`);
                        }}
                      >
                        View medicines
                      </button>

                      <a
                        className="pl-popup__link"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Get directions
                      </a>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}