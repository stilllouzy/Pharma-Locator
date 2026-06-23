import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type DeliveryStatus = "assigned" | "picked_up" | "on_the_way" | "delivered";

interface IDelivery {
  _id: string;
  user: { name: string; email: string };
  pharmacy: { name: string; address: string };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: DeliveryStatus;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  createdAt: string;
  proofOfDelivery?: {
    imageUrl: string | null;
    uploadedAt: string | null;
  };
}

// ── Status config (mirrors MyDeliveries) ─────────────────────────────────────

const STATUS_CONFIG: Record<
  DeliveryStatus,
  {
    label: string;
    accentColor: string;
    chipColor: "warning" | "info" | "primary" | "success";
  }
> = {
  assigned:   { label: "Assigned",   accentColor: "#F57F17", chipColor: "warning" },
  picked_up:  { label: "Picked Up",  accentColor: "#1565C0", chipColor: "info"    },
  on_the_way: { label: "On the Way", accentColor: "#E65100", chipColor: "primary" },
  delivered:  { label: "Delivered",  accentColor: "#2E7D32", chipColor: "success" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Reusable info row ─────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  text: string;
  muted?: boolean;
}

function InfoRow({ icon, text, muted = false }: InfoRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.75 }}>
      <Box sx={{ mt: "1px", flexShrink: 0, color: "text.disabled" }}>{icon}</Box>
      <Typography
        variant="body2"
        sx={{ color: muted ? "text.disabled" : "text.secondary", lineHeight: 1.5 }}
      >
        {text}
      </Typography>
    </Box>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "text.disabled",
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeliveryDetails() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [delivery, setDelivery]   = useState<IDelivery | null>(null);
  const [loading, setLoading]     = useState(false);
  const [podBase64, setPodBase64] = useState<string>("");
  const [podPreview, setPodPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rider/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDelivery(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [id]);

  const handlePodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPodBase64(base64);
      setPodPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadAndDeliver = async () => {
    if (!podBase64) return alert("Please select an image first.");
    setUploading(true);
    try {
      await api.patch(
        `/orders/${id}/proof-of-delivery`,
        { imageUrl: podBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Proof of delivery uploaded! Order marked as delivered.");
      fetchDetails();
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={120} height={36} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2.5 }} />
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ display: "flex" }}>
            <Skeleton variant="rectangular" width={4} height={160} sx={{ flexShrink: 0 }} />
            <CardContent sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="70%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="60%" height={14} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="50%" height={14} />
            </CardContent>
          </Box>
          <Skeleton variant="rectangular" height={44} />
          <Skeleton variant="rectangular" height={44} sx={{ mt: "2px" }} />
        </Card>
      </Box>
    );
  }

  if (!delivery) {
    return (
      <Box sx={{ textAlign: "center", pt: 8 }}>
        <Typography color="text.secondary">Delivery not found.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/rider/deliveries")}>
          Go back
        </Button>
      </Box>
    );
  }

  const config = STATUS_CONFIG[delivery.deliveryStatus] ?? STATUS_CONFIG.assigned;

  return (
    <Box>
      {/* ── Back button ── */}
      <Button
        size="small"
        startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: "13px !important" }} />}
        onClick={() => navigate("/rider/deliveries")}
        sx={{ mb: 2, fontSize: "0.8rem", color: "text.secondary", pl: 0 }}
      >
        My Deliveries
      </Button>

      {/* ── Page title ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
          Delivery Details
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Order #{delivery._id.slice(-8).toUpperCase()}
        </Typography>
      </Box>

      {/* ── Main card ── */}
      <Card sx={{ borderRadius: 3, overflow: "hidden", mb: 2 }}>

        {/* ── Header: accent bar + customer name + status chips ── */}
        <Box sx={{ display: "flex" }}>
          <Box
            sx={{
              width: 4,
              flexShrink: 0,
              backgroundColor: config.accentColor,
            }}
          />
          <CardContent sx={{ flex: 1, pb: "12px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1,
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}>
                {delivery.user?.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Chip
                  label={config.label}
                  color={config.chipColor}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: "0.68rem" }}
                />
                <Chip
                  label={delivery.status.toUpperCase()}
                  variant="outlined"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.68rem" }}
                />
              </Box>
            </Box>

            <InfoRow icon={<PersonOutlineRoundedIcon sx={{ fontSize: 14 }} />} text={delivery.user?.name} />
            <InfoRow icon={<EmailOutlinedIcon sx={{ fontSize: 14 }} />} text={delivery.user?.email} muted />
            <InfoRow
              icon={<AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />}
              text={`Ordered ${formatDate(delivery.createdAt)}`}
              muted
            />
          </CardContent>
        </Box>

        {/* ── Pickup & Delivery addresses ── */}
        <Box
          sx={{
            borderTop: "0.5px solid rgba(0,0,0,0.06)",
            px: 2.25,
            py: 1.5,
            display: "flex",
            gap: 2,
          }}
        >
          {/* Pickup */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SectionLabel>Pickup from</SectionLabel>
            <InfoRow icon={<StoreOutlinedIcon sx={{ fontSize: 14 }} />} text={delivery.pharmacy?.name} />
            <InfoRow icon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />} text={delivery.pharmacy?.address} muted />
          </Box>

          {/* Divider */}
          <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

          {/* Deliver to */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SectionLabel>Deliver to</SectionLabel>
            <InfoRow icon={<PlaceOutlinedIcon sx={{ fontSize: 14 }} />} text={delivery.deliveryAddress} />
          </Box>
        </Box>

        {/* ── Items strip ── */}
        <Box
          sx={{
            borderTop: "0.5px solid rgba(0,0,0,0.06)",
            px: 2.25,
            py: 1.25,
            backgroundColor: "#FAFBFD",
          }}
        >
          <SectionLabel>Items</SectionLabel>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {delivery.items.map((item) => (
              <Box
                key={item._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#F4F7FB",
                    border: "0.5px solid rgba(0,0,0,0.07)",
                    borderRadius: "6px",
                    px: 1,
                    py: "3px",
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {item.medicine?.name} ×{item.quantity}
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>
                  {formatPeso(item.price * item.quantity)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Total + payment row ── */}
        <Box
          sx={{
            borderTop: "0.5px solid rgba(0,0,0,0.06)",
            px: 2.25,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PaymentOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" sx={{ textTransform: "capitalize" }}>
              {delivery.paymentStatus}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "primary.main" }}>
            {formatPeso(delivery.totalPrice)}
          </Typography>
        </Box>

        {/* ── Actions row ── */}
        <Box
          sx={{
            borderTop: "0.5px solid rgba(0,0,0,0.06)",
            px: 2.25,
            py: 1.5,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<MapOutlinedIcon sx={{ fontSize: "15px !important" }} />}
            href={`[google.com](https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.deliveryAddress)})`}
            target="_blank"
            sx={{ fontSize: "0.75rem" }}
          >
            Get Directions
          </Button>
        </Box>
      </Card>

      {/* ── Proof of Delivery card (on_the_way) ── */}
      {delivery.deliveryStatus === "on_the_way" && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: 4, flexShrink: 0, backgroundColor: "#E65100" }} />
            <CardContent sx={{ flex: 1, pb: "16px !important" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 0.5 }}>
                Proof of Delivery
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
                Take a photo of the delivered package and upload it to complete this delivery.
              </Typography>

              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CameraAltOutlinedIcon sx={{ fontSize: "15px !important" }} />}
                sx={{ fontSize: "0.75rem", mb: 1.5 }}
              >
                Choose Photo
                <input type="file" accept="image/*" hidden onChange={handlePodImageChange} />
              </Button>

              {podPreview && (
                <Box sx={{ mb: 1.5 }}>
                  <img
                    src={podPreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 8,
                      border: "0.5px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleUploadAndDeliver}
                disabled={!podBase64 || uploading}
                startIcon={
                  uploading
                    ? undefined
                    : <CheckCircleOutlineRoundedIcon sx={{ fontSize: "16px !important" }} />
                }
                sx={{
                  fontSize: "0.8rem",
                  backgroundColor: "#E65100",
                  "&:hover": { backgroundColor: "#BF360C" },
                  "&.Mui-disabled": { backgroundColor: "rgba(0,0,0,0.08)" },
                }}
              >
                {uploading
                  ? <CircularProgress size={18} color="inherit" />
                  : "Upload & Mark as Delivered"
                }
              </Button>
            </CardContent>
          </Box>
        </Card>
      )}

      {/* ── Proof of Delivery card (delivered — read-only) ── */}
      {delivery.deliveryStatus === "delivered" && delivery.proofOfDelivery?.imageUrl && (
        <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: 4, flexShrink: 0, backgroundColor: "#2E7D32" }} />
            <CardContent sx={{ flex: 1, pb: "16px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: "#2E7D32" }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#2E7D32" }}>
                  Proof of Delivery
                </Typography>
              </Box>

              <img
                src={delivery.proofOfDelivery.imageUrl}
                alt="Proof of Delivery"
                style={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "0.5px solid rgba(0,0,0,0.08)",
                }}
              />

              {delivery.proofOfDelivery.uploadedAt && (
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.75 }}>
                  Uploaded {formatDate(delivery.proofOfDelivery.uploadedAt)}
                </Typography>
              )}
            </CardContent>
          </Box>
        </Card>
      )}
    </Box>
  );
}
