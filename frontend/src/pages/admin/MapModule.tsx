import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import api from "../../api/api";
import L from "leaflet";
import { Box, Typography, Button, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

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
  isApproved: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapModule() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [settingLocation, setSettingLocation] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [targetPharmacy, setTargetPharmacy] = useState<string>("");

  const token = localStorage.getItem("token");

  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/pharmacies", { // ✅ fetch from Pharmacy collection
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

  const toggleStatus = async (id: string) => {
    try {
      await api.put(`/pharmacies/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPharmacies();
      setSelected(null);
    } catch (error) {
      console.log(error);
    }
  };

  const saveLocation = async () => {
    if (!pendingLocation || !targetPharmacy) return;
    try {
      await api.put(
        `/pharmacies/location/${targetPharmacy}`,
        { lat: pendingLocation.lat, lng: pendingLocation.lng },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Location saved!");
      setSettingLocation(false);
      setPendingLocation(null);
      setTargetPharmacy("");
      fetchPharmacies();
    } catch (error) {
      console.log(error);
      alert("Failed to save location");
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (settingLocation) setPendingLocation({ lat, lng });
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

      {/* SET LOCATION PANEL */}
      <Card sx={{ mb: 2, p: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Set Pharmacy Location
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Pharmacy</InputLabel>
              <Select
                value={targetPharmacy}
                label="Select Pharmacy"
                onChange={(e) => setTargetPharmacy(e.target.value)}
              >
                {pharmacies.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} {p.location?.lat ? "✅" : "❌ no location"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color={settingLocation ? "warning" : "primary"}
              onClick={() => {
                setSettingLocation(!settingLocation);
                setPendingLocation(null);
              }}
              disabled={!targetPharmacy}
            >
              {settingLocation ? "Cancel" : "Click Map to Set Location"}
            </Button>

            {pendingLocation && (
              <>
                <Typography variant="body2" color="gray">
                  Lat: {pendingLocation.lat.toFixed(5)}, Lng: {pendingLocation.lng.toFixed(5)}
                </Typography>
                <Button variant="contained" color="success" onClick={saveLocation}>
                  Save Location
                </Button>
              </>
            )}
          </Box>

          {settingLocation && (
            <Typography variant="caption" color="primary" sx={{ mt: 1, display: "block" }}>
              🖱️ Click anywhere on the map to set the location for the selected pharmacy
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* MAIN LAYOUT */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2 }}>

        {/* MAP */}
        <Card sx={{ height: "70vh", borderRadius: 3 }}>
          <MapContainer
            center={[14.3294, 120.9367]}
            zoom={13}
            style={{ height: "100%", width: "100%", cursor: settingLocation ? "crosshair" : "grab" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onMapClick={handleMapClick} />

            {/* PHARMACY MARKERS */}
            {pharmacies
              .filter((p) => p.location?.lat && p.location?.lng)
              .map((pharmacy) => (
                <Marker
                  key={pharmacy._id}
                  position={[pharmacy.location!.lat, pharmacy.location!.lng]}
                  eventHandlers={{ click: () => setSelected(pharmacy) }}
                >
                  <Popup>
                    <strong>{pharmacy.name}</strong><br />
                    {pharmacy.address}<br />
                    Status: {pharmacy.isApproved ? "Approved" : "Not Approved"}
                  </Popup>
                </Marker>
              ))}

            {/* PENDING LOCATION MARKER */}
            {pendingLocation && (
              <Marker position={[pendingLocation.lat, pendingLocation.lng]}>
                <Popup>New location preview</Popup>
              </Marker>
            )}
          </MapContainer>
        </Card>

        {/* SIDE PANEL */}
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
                <Typography sx={{ fontWeight: "bold" }}>{selected.name}</Typography>
                <Typography variant="body2">{selected.address}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Status: {selected.isApproved ? "Approved" : "Not Approved"}
                </Typography>
                <Typography variant="caption" sx={{ display: "block" }}>
                  Lat: {selected.location?.lat}
                </Typography>
                <Typography variant="caption" sx={{ display: "block" }}>
                  Lng: {selected.location?.lng}
                </Typography>

                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color={selected.isApproved ? "warning" : "success"}
                  onClick={() => toggleStatus(selected._id)}
                >
                  {selected.isApproved ? "Disapprove" : "Approve"}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}