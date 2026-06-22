import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../../api/api";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, type Theme } from "@mui/material";
import "./mapPopup.css";

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
}

export default function MapView({ onSelectPharmacy }: MapViewProps) {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<IPharmacy | null>(null);

  const navigate = useNavigate();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const popupMaxWidth = isMobile ? 200 : 260;
  const popupMinWidth = isMobile ? 160 : 200;

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

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={userLocation || [14.3294, 120.9367]} // fallback: Dasmariñas
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
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

        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy._id}
            position={[pharmacy.location.lat, pharmacy.location.lng]}
            eventHandlers={{
              click: () => {
                setSelected(pharmacy);
                onSelectPharmacy(pharmacy._id, pharmacy.name);
              },
            }}
          />
        ))}

        {selected && (
          <Popup
            position={[selected.location.lat, selected.location.lng]}
            maxWidth={popupMaxWidth}
            minWidth={popupMinWidth}
            eventHandlers={{ remove: () => setSelected(null) }}
          >
            <div className="pl-popup">
              <p className="pl-popup__name">{selected.name}</p>
              <p className="pl-popup__address">{selected.address}</p>

              <div className="pl-popup__actions">
                <button
                  className="pl-popup__button"
                  onClick={() => {
                    onSelectPharmacy(selected._id, selected.name);
                    navigate(`/user?pharmacy=${selected._id}`);
                  }}
                >
                  View medicines
                </button>

                <a
                  className="pl-popup__link"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selected.location.lat},${selected.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get directions
                </a>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}