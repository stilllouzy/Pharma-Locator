import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../../api/api";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// 🔥 FIX LEAFLET DEFAULT ICON
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function MapView({
  onSelectPharmacy,
}: {
  onSelectPharmacy: (id: string) => void;
}) {
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const navigate = useNavigate();

  // 📍 GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (_err) => {
        console.log("Location permission denied");
      }
    );
  }, []);

  // 🏥 FETCH PHARMACIES
  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/pharmacies");
      setPharmacies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={userLocation || [14.3294, 120.9367]} // fallback: Dasma
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* 🗺️ MAP TILE */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 📍 USER LOCATION */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* 🏥 PHARMACY MARKERS */}
        {pharmacies.map((pharmacy) => (
          <Marker
            key={pharmacy._id}
            position={[
              pharmacy.location.lat,
              pharmacy.location.lng,
            ]}
            eventHandlers={{
              click: () => {
                setSelected(pharmacy);
                onSelectPharmacy(pharmacy._id); // 🔥 instant filter
              },
            }}
          />
        ))}

        {/* 📌 SELECTED PHARMACY POPUP */}
        {selected && (
          <Popup
            position={[
              selected.location.lat,
              selected.location.lng,
            ]}
            eventHandlers={{
              remove: () => setSelected(null),
            }}
          >
            <div>
              <h4>{selected.name}</h4>
              <p>{selected.address}</p>

              {/* 🔥 VIEW MEDICINES */}
              <button
                onClick={() => {
                  onSelectPharmacy(selected._id);
                  navigate(`/user?pharmacy=${selected._id}`);
                }}
              >
                View Medicines
              </button>

              <br />

              {/* 🧭 DIRECTIONS */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.location.lat},${selected.location.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Get Directions
              </a>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}