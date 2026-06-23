import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Skeleton,
} from "@mui/material";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import NavigationOutlinedIcon from "@mui/icons-material/NavigationOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
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

// ── Types ────────────────────────────────────────────────────────────────────

interface IDelivery {
  _id: string;
  user: { name: string };
  deliveryAddress: string;
  deliveryStatus: string;
  totalPrice: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type DeliveryStatus = "assigned" | "picked_up" | "on_the_way" | "delivered";

const STATUS_META: Record<
  DeliveryStatus,
  { label: string; color: string; chipColor: "warning" | "info" | "primary" | "success" }
> = {
  assigned:   { label: "Assigned",    color: "#F57F17", chipColor: "warning" },
  picked_up:  { label: "Picked up",   color: "#1565C0", chipColor: "info"    },
  on_the_way: { label: "On the way",  color: "#E65100", chipColor: "primary" },
  delivered:  { label: "Delivered",   color: "#2E7D32", chipColor: "success" },
};

function getStatusMeta(status: string) {
  return STATUS_META[status as DeliveryStatus] ?? STATUS_META.assigned;
}

// ── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          backgroundColor: "#F4F7FB",
          color: "text.secondary",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: "text.disabled", display: "block", lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary", mt: 0.25 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeliveryMapView() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<IDelivery | null>(null);
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Rider location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setRiderLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationLoading(false);
      },
      (err) => {
        console.log("Location permission denied", err);
        setLocationLoading(false);
      }
    );
  }, []);

  // Active deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await api.get("/rider/deliveries", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeliveries(res.data);
        if (res.data.length > 0) setSelectedDelivery(res.data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setDeliveriesLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const meta = selectedDelivery ? getStatusMeta(selectedDelivery.deliveryStatus) : null;

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ mb: 3}}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 , justifyContent: "center" }}>
          <MapOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main"}}>
            Delivery Map
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">
          Navigate to your assigned delivery locations
        </Typography>
      </Box>

      {/* ── Delivery selector ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: "text.disabled", mb: 1.25, display: "block" }}>
          Active deliveries
        </Typography>
        <Card>
          <CardContent>
            {deliveriesLoading ? (
              <Skeleton variant="rounded" height={56} />
            ) : deliveries.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "9px",
                    backgroundColor: "#F4F7FB",
                    color: "text.disabled",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary" }}>
                    No active deliveries
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    You'll see assigned orders here
                  </Typography>
                </Box>
              </Box>
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Select delivery</InputLabel>
                <Select
                  value={selectedDelivery?._id ?? ""}
                  label="Select delivery"
                  onChange={(e) => {
                    const found = deliveries.find((d) => d._id === e.target.value);
                    if (found) setSelectedDelivery(found);
                  }}
                >
                  {deliveries.map((d) => {
                    const m = getStatusMeta(d.deliveryStatus);
                    return (
                      <MenuItem key={d._id} value={d._id}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: m.color,
                              flexShrink: 0,
                            }}
                          />
                          <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {d.user?.name} — {d.deliveryAddress}
                          </Typography>
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Map ── */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.25,
          }}
        >
          <Typography variant="overline" sx={{ color: "text.disabled" }}>
            Live map
          </Typography>
          {selectedDelivery && (
          <Button
  variant="contained"
  size="small"
  startIcon={<NavigationOutlinedIcon sx={{ fontSize: 15 }} />}
  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    selectedDelivery.deliveryAddress
  )}`}
  target="_blank"
  disableElevation
  sx={{
    borderRadius: "8px",
    textTransform: "none",
    fontSize: 12,
    py: 0.5,
    px: 1.5,
  }}
>
  Get directions
</Button>
          )}
        </Box>

        <Card sx={{ overflow: "hidden" }}>
          {locationLoading ? (
            <Skeleton variant="rounded" height="60vh" sx={{ borderRadius: 0 }} />
          ) : (
            <MapContainer
              center={riderLocation ?? [14.3294, 120.9367]}
              zoom={14}
              style={{ height: "60vh", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {riderLocation && (
                <Marker position={riderLocation}>
                  <Popup>You are here</Popup>
                </Marker>
              )}
            </MapContainer>
          )}
        </Card>
      </Box>

      {/* ── Delivery detail ── */}
      {selectedDelivery && meta && (
        <Box>
          <Typography variant="overline" sx={{ color: "text.disabled", mb: 1.25, display: "block" }}>
            Delivery details
          </Typography>
          <Card>
            <CardContent>
              {/* Header row */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "primary.main" }}>
                  {selectedDelivery.user?.name ?? "Customer"}
                </Typography>
                <Chip
                  label={meta.label}
                  color={meta.chipColor}
                  size="small"
                />
              </Box>

              {/* Divider */}
              <Box sx={{ borderTop: "0.5px solid rgba(0,0,0,0.06)", mb: 2 }} />

              {/* Info rows */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                <InfoRow
                  icon={<LocationOnOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="Delivery address"
                  value={selectedDelivery.deliveryAddress}
                />
                <InfoRow
                  icon={<LocalShippingOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="Order total"
                  value={`₱${selectedDelivery.totalPrice.toLocaleString()}`}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}

