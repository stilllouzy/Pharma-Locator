import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  PeopleAlt,
  LocalPharmacy,
  MedicalServices,
  ShoppingCart,
  Warning,
  CheckCircle,
  HourglassEmpty,
  FiberManualRecord,
  ChevronRight,
  ArrowForward,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardData {
  users: number;
  pharmacies: number;
  medicines: number;
  orders: number;
  lowStock: number;
  pendingOrders: number;
  completedOrders: number;
}

// ─── Clickable KPI card ───────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "default" | "warning" | "success";
  to: string;
  hint?: string;
}

function KpiCard({ label, value, icon, accent = "default", to, hint }: KpiCardProps) {
  const navigate = useNavigate();
  const colors = {
    default: { icon: "#0D3B6E", bg: "#EEF4FB" },
    warning: { icon: "#F57F17", bg: "#FFF8E1" },
    success: { icon: "#2E7D32", bg: "#E8F5E9" },
  };
  const { icon: iconColor, bg: iconBg } = colors[accent];

  return (
    <Tooltip title={hint ?? `Go to ${label}`} placement="top">
      <Card
        onClick={() => navigate(to)}
        sx={{
          cursor: "pointer",
          transition: "box-shadow 0.2s ease, transform 0.15s ease",
          "&:hover": {
            boxShadow: "0 6px 24px rgba(13,59,110,0.12)",
            transform: "translateY(-2px)",
            "& .arrow-icon": { opacity: 1 },
          },
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: "18px !important",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              backgroundColor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ lineHeight: 1.2, display: "block" }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: accent === "warning" ? "warning.main" : "text.primary",
                lineHeight: 1.3,
              }}
            >
              {value}
            </Typography>
          </Box>
          <ChevronRight
            className="arrow-icon"
            sx={{
              fontSize: 18,
              color: "text.disabled",
              opacity: 0,
              transition: "opacity 0.15s ease",
              flexShrink: 0,
            }}
          />
        </CardContent>
      </Card>
    </Tooltip>
  );
}

// ─── Headline insight ─────────────────────────────────────────────────────────
function HeadlineInsight({
  data,
  onClick,
}: {
  data: DashboardData;
  onClick: (path: string) => void;
}) {
  const insight = (() => {
    if (data.pendingOrders > 0) {
      return {
        icon: <HourglassEmpty sx={{ fontSize: 20 }} />,
        color: "#F57F17",
        bg: "#FFF8E1",
        text: `${data.pendingOrders} order${data.pendingOrders !== 1 ? "s" : ""} waiting for action`,
        sub: "Review and update order statuses.",
        path: "/admin/orders",
        chip: { label: "Needs attention", color: "warning" as const },
      };
    }
    if (data.lowStock > 0) {
      return {
        icon: <Warning sx={{ fontSize: 20 }} />,
        color: "#C62828",
        bg: "#FFEBEE",
        text: `${data.lowStock} medicine${data.lowStock !== 1 ? "s" : ""} running low on stock`,
        sub: "Notify pharmacy staff to restock.",
        path: "/admin/reports",
        chip: { label: "Low stock", color: "error" as const },
      };
    }
    return {
      icon: <CheckCircle sx={{ fontSize: 20 }} />,
      color: "#2E7D32",
      bg: "#E8F5E9",
      text: "Everything looks good — system is running normally.",
      sub: `${data.completedOrders} orders completed so far.`,
      path: "/admin/reports",
      chip: { label: "All clear", color: "success" as const },
    };
  })();

  return (
    <Card
      onClick={() => onClick(insight.path)}
      sx={{
        cursor: "pointer",
        border: `1px solid ${insight.bg}`,
        transition: "box-shadow 0.2s ease, transform 0.15s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(13,59,110,0.10)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "16px !important" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: insight.bg,
            color: insight.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {insight.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 0.25 }}>
            {insight.text}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {insight.sub}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <Chip label={insight.chip.label} color={insight.chip.color} size="small" />
          <ArrowForward sx={{ fontSize: 16, color: "text.disabled" }} />
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Completion bar ───────────────────────────────────────────────────────────
function CompletionBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          Order completion rate
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
          {pct}%
        </Typography>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 3,
            backgroundColor: "#5BC4A0",
            transition: "width 0.6s ease",
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={280} height={20} sx={{ mb: 3 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 2,
            mb: 2,
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={82} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={72} sx={{ mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Skeleton variant="rounded" height={180} />
          <Skeleton variant="rounded" height={180} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box
        sx={{
          mb: 3.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
            System overview and monitoring
          </Typography>
        </Box>
        <Chip
          icon={<FiberManualRecord sx={{ fontSize: "10px !important" }} />}
          label="System active"
          color="success"
          size="small"
          sx={{ mt: 0.5 }}
        />
      </Box>

      {/* KPI cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <KpiCard label="Total users"  value={data.users}      icon={<PeopleAlt fontSize="small" />}      to="/admin/users"      hint="View all users" />
        <KpiCard label="Pharmacies"   value={data.pharmacies} icon={<LocalPharmacy fontSize="small" />}  to="/admin/pharmacies" hint="View pharmacies" />
        <KpiCard label="Medicines"    value={data.medicines}  icon={<MedicalServices fontSize="small" />} to="/admin/medicines"  hint="View medicines" />
        <KpiCard label="Total orders" value={data.orders}     icon={<ShoppingCart fontSize="small" />}   to="/admin/orders"     hint="View orders"    accent="success" />
        <KpiCard label="Low stock"    value={data.lowStock}   icon={<Warning fontSize="small" />}        to="/admin/reports"    hint="View inventory report" accent="warning" />
      </Box>

      {/* Headline insight */}
      <Box sx={{ mb: 2 }}>
        <HeadlineInsight data={data} onClick={(path) => navigate(path)} />
      </Box>

      {/* Bottom cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {/* Order status */}
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 0.5 }}>Order status</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Live breakdown of order activity</Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0, mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                  borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HourglassEmpty sx={{ fontSize: 16, color: "warning.main" }} />
                  <Typography variant="body2">Pending</Typography>
                </Box>
                <Chip label={`${data.pendingOrders} pending`} color="warning" size="small" />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                  <Typography variant="body2">Completed</Typography>
                </Box>
                <Chip label={`${data.completedOrders} done`} color="success" size="small" />
              </Box>
            </Box>

            <CompletionBar completed={data.completedOrders} total={data.orders} />

            <Box
              onClick={() => navigate("/admin/orders")}
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                color: "#0D3B6E",
                width: "fit-content",
                "&:hover": { opacity: 0.7 },
              }}
            >
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>View all orders</Typography>
              <ArrowForward sx={{ fontSize: 14 }} />
            </Box>
          </CardContent>
        </Card>

        {/* System insights */}
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 0.5 }}>System insights</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Health and status at a glance</Typography>

            {[
              {
                label: "Low stock items",
                chip: data.lowStock > 0
                  ? { label: `${data.lowStock} items`, color: "warning" as const }
                  : { label: "All stocked", color: "success" as const },
                path: "/admin/reports",
              },
              {
                label: "System status",
                chip: { label: "Active", color: "success" as const },
                path: null,
              },
              {
                label: "Orders processing",
                chip: { label: "Normal", color: "info" as const },
                path: null,
              },
              {
                label: "Registered pharmacies",
                chip: { label: `${data.pharmacies} total`, color: "default" as const },
                path: "/admin/pharmacies",
              },
            ].map((row, i, arr) => (
              <Box
                key={row.label}
                onClick={() => row.path && navigate(row.path)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.25,
                  px: 0.5,
                  borderBottom: i < arr.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                  borderRadius: "6px",
                  cursor: row.path ? "pointer" : "default",
                  "&:hover": row.path ? { backgroundColor: "rgba(13,59,110,0.03)" } : {},
                }}
              >
                <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                <Chip label={row.chip.label} color={row.chip.color} size="small" />
              </Box>
            ))}

            <Box
              onClick={() => navigate("/admin/reports")}
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                color: "#0D3B6E",
                width: "fit-content",
                "&:hover": { opacity: 0.7 },
              }}
            >
              <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>View full report</Typography>
              <ArrowForward sx={{ fontSize: 14 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}