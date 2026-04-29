import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../../api/api";
import L from "leaflet";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";

// 🔥 FIX LEAFLET ICON ISSUE
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Pharmacy {
  _id: string;
  name: string;
  address: string;
  isActive: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export default function MapModule() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selected, setSelected] = useState<Pharmacy | null>(null);

  const token = localStorage.getItem("token");

  // 🏥 FETCH ALL PHARMACIES
  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/admin/pharmacies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPharmacies(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  // 🔄 TOGGLE STATUS (ADMIN ACTION)
  const toggleStatus = async (id: string) => {
    try {
      await api.put(
        `/admin/pharmacies/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Pharmacy Location Management
        </Typography>
        <Typography variant="caption" color="gray">
          Admin monitoring of pharmacy locations
        </Typography>
      </Box>

      {/* MAIN LAYOUT */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "2fr 1fr",
          },
          gap: 2,
        }}
      >

        {/* 🗺️ MAP */}
        <Card sx={{ height: "70vh", borderRadius: 3 }}>
          <MapContainer
            center={[14.3294, 120.9367]} // Dasmariñas fallback
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {pharmacies
  .filter((p) => p.location?.lat && p.location?.lng)
  .map((pharmacy) => (
              <Marker
                key={pharmacy._id}
                position={[
                  pharmacy.location.lat,
                  pharmacy.location.lng,
                ]}
                eventHandlers={{
                  click: () => setSelected(pharmacy),
                }}
              >
                <Popup>
                  <strong>{pharmacy.name}</strong>
                  <br />
                  {pharmacy.address}
                  <br />
                  Status:{" "}
                  {pharmacy.isActive ? "Active" : "Inactive"}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Card>

        {/* 📊 SIDE PANEL */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>

            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Pharmacy Details
            </Typography>

            {!selected ? (
              <Typography variant="body2" color="gray">
                Click a marker to view details
              </Typography>
            ) : (
              <Box>

                <Typography sx={{ fontWeight: "bold" }}>
                  {selected.name}
                </Typography>

                <Typography variant="body2">
                  {selected.address}
                </Typography>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  Status:{" "}
                  {selected.isActive ? "Active" : "Inactive"}
                </Typography>

                <Typography variant="caption" sx={{ display: "block" }}>
                  Lat: {selected.location.lat}
                </Typography>

                <Typography variant="caption" sx={{ display: "block" }}>
                  Lng: {selected.location.lng}
                </Typography>

                {/* ADMIN ACTIONS */}
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color={selected.isActive ? "warning" : "success"}
                  onClick={() => toggleStatus(selected._id)}
                >
                  {selected.isActive ? "Deactivate" : "Activate"}
                </Button>

              </Box>
            )}

          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}