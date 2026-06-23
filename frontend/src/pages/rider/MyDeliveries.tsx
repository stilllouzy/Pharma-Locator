import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import TruckIcon from "@mui/icons-material/LocalShippingOutlined";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  createdAt: string;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DeliveryStatus,
  {
    label: string;
    accentColor: string;
    chipColor: "warning" | "info" | "primary" | "success";
  }
> = {
  assigned:   { label: "Assigned",   accentColor: "#F57F17", chipColor: "warning" },
  picked_up:  { label: "Picked up",  accentColor: "#1565C0", chipColor: "info"    },
  on_the_way: { label: "On the way", accentColor: "#E65100", chipColor: "primary" },
  delivered:  { label: "Delivered",  accentColor: "#2E7D32", chipColor: "success" },
};

type FilterKey = "all" | DeliveryStatus;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  });
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Delivery card ─────────────────────────────────────────────────────────────

interface DeliveryCardProps {
  delivery: IDelivery;
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: (id: string) => void;
}

function DeliveryCard({ delivery, onUpdateStatus, onViewDetails }: DeliveryCardProps) {
  const config = STATUS_CONFIG[delivery.deliveryStatus];

  // Collapse items: show first 2, then "+N more"
  const visibleItems = delivery.items.slice(0, 2);
  const extraCount   = delivery.items.length - 2;

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      {/* ── Card body ── */}
      <Box sx={{ display: "flex" }}>
        {/* Left accent bar */}
        <Box
          sx={{
            width: 4,
            flexShrink: 0,
            backgroundColor: config.accentColor,
            borderRadius: 0,
          }}
        />

        <CardContent sx={{ flex: 1, minWidth: 0, pb: "12px !important" }}>
          {/* Top row: customer name + status chip */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}>
              {delivery.user?.name}
            </Typography>
            <Chip
              label={config.label}
              color={config.chipColor}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 700, fontSize: "0.68rem" }}
            />
          </Box>

          {/* Pharmacy */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <StoreOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {delivery.pharmacy?.name}
            </Typography>
          </Box>

          {/* Delivery address */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <PlaceOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {delivery.deliveryAddress}
            </Typography>
          </Box>

          {/* Order time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
            <Typography variant="caption" color="text.disabled">
              Ordered {formatDate(delivery.createdAt)}
            </Typography>
          </Box>
        </CardContent>
      </Box>

      {/* ── Items strip ── */}
      <Box
        sx={{
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          px: 2.25,
          py: 1,
          display: "flex",
          gap: 0.75,
          flexWrap: "wrap",
        }}
      >
        {visibleItems.map((item) => (
          <Box
            key={item._id}
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
        ))}
        {extraCount > 0 && (
          <Box
            sx={{
              backgroundColor: "#F4F7FB",
              border: "0.5px solid rgba(0,0,0,0.07)",
              borderRadius: "6px",
              px: 1,
              py: "3px",
              fontSize: 11,
              color: "text.disabled",
            }}
          >
            +{extraCount} more
          </Box>
        )}
      </Box>

      {/* ── Actions row ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.25,
          py: 1.5,
          backgroundColor: "#FAFBFD",
        }}
      >
        {/* Primary action — changes per status */}
        {delivery.deliveryStatus === "assigned" && (
          <Button
            size="small"
            variant="contained"
            startIcon={<LocalShippingOutlinedIcon sx={{ fontSize: "15px !important" }} />}
            onClick={() => onUpdateStatus(delivery._id, "picked_up")}
            sx={{ fontSize: "0.75rem" }}
          >
            Mark picked up
          </Button>
        )}

        {delivery.deliveryStatus === "picked_up" && (
          <Button
            size="small"
            variant="contained"
            startIcon={<TruckIcon sx={{ fontSize: "15px !important" }} />}
            onClick={() => onUpdateStatus(delivery._id, "on_the_way")}
            sx={{ fontSize: "0.75rem" }}
          >
            On the way
          </Button>
        )}

        {delivery.deliveryStatus === "on_the_way" && (
          <Button
            size="small"
            variant="contained"
            startIcon={<CameraAltOutlinedIcon sx={{ fontSize: "15px !important" }} />}
            onClick={() => onViewDetails(delivery._id)}
            sx={{
              fontSize: "0.75rem",
              backgroundColor: "#E65100",
              "&:hover": { backgroundColor: "#BF360C" },
            }}
          >
            Upload proof & deliver
          </Button>
        )}

        {/* Details button (always shown) */}
        <Button
          size="small"
          variant="outlined"
          startIcon={<InfoOutlinedIcon sx={{ fontSize: "15px !important" }} />}
          onClick={() => onViewDetails(delivery._id)}
          sx={{ fontSize: "0.75rem" }}
        >
          Details
        </Button>

        {/* Total pushed to right */}
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: "primary.main",
            ml: "auto",
          }}
        >
          {formatPeso(delivery.totalPrice)}
        </Typography>
      </Box>
    </Card>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ display: "flex" }}>
        <Skeleton variant="rectangular" width={4} height={120} sx={{ flexShrink: 0 }} />
        <CardContent sx={{ flex: 1 }}>
          <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="70%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="40%" height={14} />
        </CardContent>
      </Box>
      <Skeleton variant="rectangular" height={36} sx={{ mx: 2, my: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={44} />
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const token    = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rider/deliveries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeliveries(); }, []);

  const updateStatus = async (id: string, deliveryStatus: string) => {
    try {
      await api.put(
        `/rider/deliveries/${id}/status`,
        { deliveryStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter chip counts
  const countOf = (status: DeliveryStatus) =>
    deliveries.filter((d) => d.deliveryStatus === status).length;

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all",        label: `All (${deliveries.length})`      },
    { key: "assigned",   label: `Assigned (${countOf("assigned")})` },
    { key: "picked_up",  label: `Picked up (${countOf("picked_up")})` },
    { key: "on_the_way", label: `On the way (${countOf("on_the_way")})` },
  ];

  const visible =
    activeFilter === "all"
      ? deliveries
      : deliveries.filter((d) => d.deliveryStatus === activeFilter);

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
          My Deliveries
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Active and ongoing deliveries
        </Typography>
      </Box>

      {/* ── Filter chips ── */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2.5,
          overflowX: "auto",
          pb: 0.5,
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {filters.map((f) => (
          <Box
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            sx={{
              px: 1.75,
              py: "5px",
              borderRadius: "20px",
              fontSize: 12,
              fontWeight: 600,
              border: "0.5px solid",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
              ...(activeFilter === f.key
                ? { backgroundColor: "primary.main", color: "#fff", borderColor: "primary.main" }
                : { backgroundColor: "#fff", color: "text.secondary", borderColor: "rgba(0,0,0,0.12)" }),
            }}
          >
            {f.label}
          </Box>
        ))}
      </Box>

      {/* ── Card list ── */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {loading ? (
          [1, 2, 3].map((i) => <SkeletonCard key={i} />)
        ) : visible.length === 0 ? (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ textAlign: "center", py: 5 }}>
              <LocalShippingOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                {activeFilter === "all"
                  ? "No active deliveries assigned yet."
                  : `No deliveries with status "${STATUS_CONFIG[activeFilter as DeliveryStatus]?.label}".`}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          visible.map((d) => (
            <DeliveryCard
              key={d._id}
              delivery={d}
              onUpdateStatus={updateStatus}
              onViewDetails={(id) => navigate(`/rider/detail/${id}`)}
            />
          ))
        )}
      </Box>
    </Box>
  );
}