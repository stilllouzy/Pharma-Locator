import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface IDelivery {
  _id: string;
  user: { name: string; email: string };
  pharmacy: { name: string; address: string };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatPeso(amount: number) {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Returns a stable calendar-day key, e.g. "2026-06-23"
function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const fmt = d.toLocaleDateString([], { month: "short", day: "numeric" });

  if (dayKey(iso) === dayKey(today.toISOString())) return `Today — ${fmt}`;
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return `Yesterday — ${fmt}`;
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sunday
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ── Stat card (reused pattern from RiderDashboard) ──────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  footer: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  loading: boolean;
}

function StatCard({
  label, value, footer, icon, iconBg, iconColor, valueColor, loading,
}: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Typography variant="overline" sx={{ color: "text.disabled", letterSpacing: "0.07em" }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: "9px",
              backgroundColor: iconBg, color: iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>

        {loading ? (
          <Skeleton variant="text" width={64} height={40} />
        ) : (
          <Typography sx={{ fontSize: 26, fontWeight: 700, color: valueColor, lineHeight: 1 }}>
            {value}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: "text.disabled", mt: 0.5, display: "block" }}>
          {footer}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ delivery }: { delivery: IDelivery }) {
  const visibleItems = delivery.items.slice(0, 3);
  const extraCount = delivery.items.length - 3;

  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ display: "flex" }}>
        {/* Left accent bar */}
        <Box sx={{ width: 4, flexShrink: 0, backgroundColor: "#2E7D32" }} />

        <CardContent sx={{ flex: 1, minWidth: 0, pb: "12px !important" }}>
          {/* Top row: customer name + price */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#2E7D32", flexShrink: 0 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary", lineHeight: 1.3 }}>
                {delivery.user?.name}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "primary.main", flexShrink: 0 }}>
              {formatPeso(delivery.totalPrice)}
            </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PlaceOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {delivery.deliveryAddress}
            </Typography>
          </Box>
        </CardContent>
      </Box>

      {/* Items strip */}
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

      {/* Footer: Delivered tag + time */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.25,
          py: 1,
          backgroundColor: "#FAFBFD",
        }}
      >
        <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: "#2E7D32", letterSpacing: "0.02em" }}>
          Delivered
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {formatTime(delivery.updatedAt)}
        </Typography>
      </Box>
    </Card>
  );
}

// ── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <Card sx={{ borderRadius: 3, overflow: "hidden" }}>
      <Box sx={{ display: "flex" }}>
        <Skeleton variant="rectangular" width={4} height={110} sx={{ flexShrink: 0 }} />
        <CardContent sx={{ flex: 1 }}>
          <Skeleton variant="text" width="55%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="60%" height={14} />
        </CardContent>
      </Box>
      <Skeleton variant="rectangular" height={30} sx={{ mx: 2, my: 1, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={36} />
    </Card>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rider/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ── Stats ──
  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const thisWeek = deliveries.filter((d) => new Date(d.updatedAt) >= weekStart);
    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.totalPrice || 0), 0);
    return {
      totalDelivered: deliveries.length,
      thisWeekCount: thisWeek.length,
      totalEarnings,
    };
  }, [deliveries]);

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deliveries;
    return deliveries.filter((d) =>
      d.user?.name?.toLowerCase().includes(q) ||
      d.deliveryAddress?.toLowerCase().includes(q) ||
      d.pharmacy?.name?.toLowerCase().includes(q)
    );
  }, [deliveries, search]);

  // ── Group by day, preserving most-recent-first order ──
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; items: IDelivery[] }>();
    filtered.forEach((d) => {
      const key = dayKey(d.updatedAt);
      if (!map.has(key)) {
        map.set(key, { label: dayLabel(d.updatedAt), items: [] });
      }
      map.get(key)!.items.push(d);
    });
    return Array.from(map.values());
  }, [filtered]);

  const weekRangeLabel = useMemo(() => {
    const start = startOfWeek(new Date());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString([], { month: "short", day: "numeric" });
    return `${fmt(start)}–${fmt(end)}`;
  }, []);

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <HistoryOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
            Delivery History
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">
          Completed deliveries
        </Typography>
      </Box>

      {/* ── Stat cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 2.5,
        }}
      >
        <StatCard
          label="Total delivered"
          value={stats.totalDelivered}
          footer="All time"
          icon={<EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#E3F2FD"
          iconColor="#1565C0"
          valueColor="primary.main"
          loading={loading}
        />
        <StatCard
          label="This week"
          value={stats.thisWeekCount}
          footer={weekRangeLabel}
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
          valueColor="#2E7D32"
          loading={loading}
        />
        <StatCard
          label="Total earnings"
          value={formatPeso(stats.totalEarnings)}
          footer="Order value"
          icon={<PaidOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#FFF3E0"
          iconColor="#E65100"
          valueColor="#E65100"
          loading={loading}
        />
      </Box>

      {/* ── Search ── */}
      <TextField
        fullWidth
        placeholder="Search by customer or address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5, backgroundColor: "#fff" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlinedIcon sx={{ fontSize: 19, color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* ── Grouped list ── */}
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </Box>
      ) : groups.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <HistoryOutlinedIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary" sx={{ fontSize: 14 }}>
              {search
                ? "No deliveries match your search."
                : "No delivery history yet."}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <Box key={group.label} sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: "text.disabled", mb: 1.25, display: "block" }}
            >
              {group.label}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((d) => (
                <HistoryCard key={d._id} delivery={d} />
              ))}
            </Box>
          </Box>
        ))
      )}
    </Box>
  );
}