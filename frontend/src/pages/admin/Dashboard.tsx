import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
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
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface DashboardData {
  users: number;
  pharmacies: number;
  medicines: number;
  orders: number;
  lowStock: number;
  pendingOrders: number;
  completedOrders: number;
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "default" | "warning" | "success";
}

function KpiCard({ label, value, icon, accent = "default" }: KpiCardProps) {
  const accentColors = {
    default: { icon: "#0D3B6E", bg: "#EEF4FB" },
    warning: { icon: "#F57F17", bg: "#FFF8E1" },
    success: { icon: "#2E7D32", bg: "#E8F5E9" },
  };

  const { icon: iconColor, bg: iconBg } = accentColors[accent];

  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "18px !important" }}>
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
        <Box>
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
      </CardContent>
    </Card>
  );
}

// ─── Stat Row ────────────────────────────────────────────────────────────────
interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  chip?: { label: string; color: "success" | "warning" | "error" | "info" | "default" };
}

function StatRow({ icon, label, value, chip }: StatRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.25 }}>
      <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <Typography variant="body1" sx={{ flex: 1, color: "text.primary" }}>
        {label}
      </Typography>
      {chip ? (
        <Chip label={chip.label} color={chip.color} size="small" />
      ) : (
        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const token = localStorage.getItem("token");

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

  // ── Loading State ──────────────────────────────────────────────────────────
  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="text" width={200} height={36} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width={280} height={20} sx={{ mb: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 2, mb: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={82} />
          ))}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Skeleton variant="rounded" height={200} />
          <Skeleton variant="rounded" height={200} />
        </Box>
      </Box>
    );
  }

  const completionRate =
    data.orders > 0 ? Math.round((data.completedOrders / data.orders) * 100) : 0;

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3.5, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
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

      {/* ── KPI Cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <KpiCard label="Users" value={data.users} icon={<PeopleAlt fontSize="small" />} />
        <KpiCard label="Pharmacies" value={data.pharmacies} icon={<LocalPharmacy fontSize="small" />} />
        <KpiCard label="Medicines" value={data.medicines} icon={<MedicalServices fontSize="small" />} />
        <KpiCard label="Total orders" value={data.orders} icon={<ShoppingCart fontSize="small" />} accent="success" />
        <KpiCard label="Low stock" value={data.lowStock} icon={<Warning fontSize="small" />} accent="warning" />
      </Box>

      {/* ── Status Section ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >

        {/* Order Status */}
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              Order status
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Live breakdown of order activity
            </Typography>

            <StatRow
              icon={<HourglassEmpty sx={{ fontSize: 18 }} />}
              label="Pending"
              value={data.pendingOrders}
              chip={{ label: `${data.pendingOrders} pending`, color: "warning" }}
            />
            <Divider />
            <StatRow
              icon={<CheckCircle sx={{ fontSize: 18 }} />}
              label="Completed"
              value={data.completedOrders}
              chip={{ label: `${data.completedOrders} done`, color: "success" }}
            />
            <Divider />

            {/* Completion bar */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                <Typography variant="caption">Completion rate</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                  {completionRate}%
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
                    width: `${completionRate}%`,
                    borderRadius: 3,
                    backgroundColor: "#5BC4A0",
                    transition: "width 0.6s ease",
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* System Insights */}
        <Card>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 0.5 }}>
              System insights
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Health and status at a glance
            </Typography>

            <StatRow
              icon={<Warning sx={{ fontSize: 18, color: "warning.main" }} />}
              label="Low stock items"
              value={data.lowStock}
              chip={
                data.lowStock > 0
                  ? { label: "Needs attention", color: "warning" }
                  : { label: "All stocked", color: "success" }
              }
            />
            <Divider />
            <StatRow
              icon={<FiberManualRecord sx={{ fontSize: 14, color: "#5BC4A0" }} />}
              label="System status"
              value=""
              chip={{ label: "Active", color: "success" }}
            />
            <Divider />
            <StatRow
              icon={<ShoppingCart sx={{ fontSize: 18 }} />}
              label="Orders processing"
              value=""
              chip={{ label: "Normal", color: "info" }}
            />
            <Divider />
            <StatRow
              icon={<LocalPharmacy sx={{ fontSize: 18 }} />}
              label="Registered pharmacies"
              value={data.pharmacies}
            />
          </CardContent>
        </Card>

      </Box>
    </Box>
  );
}