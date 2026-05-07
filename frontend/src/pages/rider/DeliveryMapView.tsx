import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { Box, Typography, Card, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import api from "../../api/api";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface IDelivery {
  _id: string;
  user: { name: string };
  deliveryAddress: string;
  deliveryStatus: string;
  totalPrice: number;
}

export default function DeliveryMapView() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);
  const token = localStorage.getItem("token");

  // GET RIDER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRiderLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.log("Location permission denied", err);
      }
    );
  }, []);

  // FETCH ACTIVE DELIVERIES
  const fetchDeliveries = async () => {
    try {
      const res = await api.get("/rider/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
      if (res.data.length > 0) setSelectedDelivery(res.data[0]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Delivery Map
        </Typography>
        <Typography variant="caption" color="gray">
          Navigate to customer location
        </Typography>
      </Box>

      {/* DELIVERY SELECT */}
      {deliveries.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Delivery</InputLabel>
          <Select
            value={selectedDelivery?._id ?? ""}
            label="Select Delivery"
            onChange={(e) => {
              const found = deliveries.find((d) => d._id === e.target.value);
              if (found) setSelectedDelivery(found);
            }}
          >
            {deliveries.map((d) => (
              <MenuItem key={d._id} value={d._id}>
                {d.user?.name} — {d.deliveryAddress}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* NO DELIVERIES */}
      {deliveries.length === 0 && (
        <Typography color="gray" sx={{ mb: 2 }}>
          No active deliveries assigned.
        </Typography>
      )}

      {/* GET DIRECTIONS BUTTON */}
      {selectedDelivery && (
        <Button
          variant="contained"
          sx={{ mb: 2 }}
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedDelivery.deliveryAddress)}`}
          target="_blank"
        >
          Get Directions on Google Maps
        </Button>
      )}

      {/* MAP */}
      <Card sx={{ height: "65vh", borderRadius: 3 }}>
        <MapContainer
          center={riderLocation || [14.3294, 120.9367]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* RIDER LOCATION */}
          {riderLocation && (
            <Marker position={riderLocation}>
              <Popup>You are here</Popup>
            </Marker>
          )}

        </MapContainer>
      </Card>

      {/* DELIVERY INFO */}
      {selectedDelivery && (
        <Card sx={{ mt: 2, borderRadius: 3, p: 2 }}>
          <Typography sx={{ fontWeight: "bold" }}>
            Delivering to: {selectedDelivery.user?.name}
          </Typography>
          <Typography variant="body2">
            Address: {selectedDelivery.deliveryAddress}
          </Typography>
          <Typography variant="body2">
            Status: {selectedDelivery.deliveryStatus.replace("_", " ").toUpperCase()}
          </Typography>
          <Typography variant="body2">
            Total: ₱{selectedDelivery.totalPrice}
          </Typography>
        </Card>
      )}
    </Box>
  );
}