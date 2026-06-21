import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InsightsIcon from "@mui/icons-material/Insights";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface Analytics {
  users: number;
  pharmacies: number;
  orders: number;
  medicines: number;
  lowStock: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

const EMPTY: Analytics = {
  users: 0,
  pharmacies: 0,
  orders: 0,
  medicines: 0,
  lowStock: 0,
  completedOrders: 0,
  pendingOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0,
};

// ─── Overview stat card ───────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: "18px !important" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: iconBg,
            color: iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" sx={{ lineHeight: 1.2, display: "block" }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Order breakdown bar ──────────────────────────────────────────────────────
function OrderBar({
  label,
  value,
  total,
  color,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color, display: "flex" }}>{icon}</Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
            {label}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "text.primary" }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            ({pct}%)
          </Typography>
        </Box>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: "rgba(0,0,0,0.06)",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );
}

// ─── Metric row (derived stats) ───────────────────────────────────────────────
function MetricRow({
  label,
  value,
  chip,
}: {
  label: string;
  value: string;
  chip?: { label: string; color: "success" | "warning" | "error" | "info" };
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.25,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: "text.primary" }}>
          {value}
        </Typography>
        {chip && <Chip label={chip.label} color={chip.color} size="small" />}
      </Box>
    </Box>
  );
}

export default function ReportsAnalytics() {
  const [data, setData] = useState<Analytics>(EMPTY);

  const token = localStorage.getItem("token");

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (error) {
      console.log("Analytics error:", error);
      setData(EMPTY);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Derived metrics
  const completionRate = data.orders > 0
    ? Math.round((data.completedOrders / data.orders) * 100)
    : 0;
  const cancellationRate = data.orders > 0
    ? Math.round((data.cancelledOrders / data.orders) * 100)
    : 0;
  const lowStockRate = data.medicines > 0
    ? Math.round((data.lowStock / data.medicines) * 100)
    : 0;

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
          System insights and performance overview
        </Typography>
      </Box>

      {/* Overview cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 2,
        }}
      >
        <StatCard label="Total users" value={data.users} icon={<PeopleAltIcon fontSize="small" />} iconBg="#EEF4FB" iconColor="#0D3B6E" />
        <StatCard label="Pharmacies" value={data.pharmacies} icon={<LocalPharmacyIcon fontSize="small" />} iconBg="#E8F5E9" iconColor="#2E7D32" />
        <StatCard label="Total orders" value={data.orders} icon={<ShoppingCartIcon fontSize="small" />} iconBg="#E3F2FD" iconColor="#1565C0" />
        <StatCard label="Medicines" value={data.medicines} icon={<MedicalServicesIcon fontSize="small" />} iconBg="#F3E5F5" iconColor="#6A1B9A" />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >

        {/* Revenue highlight */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #0D3B6E 0%, #1565C0 100%)",
            color: "#fff",
          }}
        >
          <CardContent sx={{ py: "20px !important" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AttachMoneyIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }} />
              <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1 }}>
                Total revenue
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "2rem", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
              ₱{data.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5, display: "block" }}>
              From {data.completedOrders} completed order{data.completedOrders !== 1 ? "s" : ""}
            </Typography>
          </CardContent>
        </Card>

        {/* Derived metrics */}
        <Card>
          <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#EEF4FB", color: "#0D3B6E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <InsightsIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                  Performance metrics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Derived from current data
                </Typography>
              </Box>
            </Box>

            <MetricRow
              label="Order completion rate"
              value={`${completionRate}%`}
              chip={completionRate >= 70 ? { label: "Healthy", color: "success" } : { label: "Needs attention", color: "warning" }}
            />
            <Divider />
            <MetricRow
              label="Cancellation rate"
              value={`${cancellationRate}%`}
              chip={cancellationRate <= 10 ? { label: "Normal", color: "success" } : { label: "High", color: "error" }}
            />
            <Divider />
            <MetricRow
              label="Low stock ratio"
              value={`${lowStockRate}% of medicines`}
              chip={lowStockRate === 0 ? { label: "All stocked", color: "success" } : lowStockRate <= 20 ? { label: "Moderate", color: "warning" } : { label: "Critical", color: "error" }}
            />
          </CardContent>
        </Card>

      </Box>

      {/* Order breakdown */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#E3F2FD", color: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingCartIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                Order breakdown
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Distribution of {data.orders} total order{data.orders !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

          <OrderBar
            label="Completed"
            value={data.completedOrders}
            total={data.orders}
            color="#2E7D32"
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
          />
          <OrderBar
            label="Pending"
            value={data.pendingOrders}
            total={data.orders}
            color="#F57F17"
            icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />}
          />
          <OrderBar
            label="Cancelled"
            value={data.cancelledOrders}
            total={data.orders}
            color="#C62828"
            icon={<CancelIcon sx={{ fontSize: 16 }} />}
          />
        </CardContent>
      </Card>

      {/* Inventory insights */}
      <Card>
        <CardContent sx={{ px: "20px !important", py: "20px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: data.lowStock > 0 ? "#FFF8E1" : "#E8F5E9", color: data.lowStock > 0 ? "#F57F17" : "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <WarningAmberIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}>
                Inventory insights
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Medicine stock health across all pharmacies
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 1.5,
              borderRadius: "8px",
              backgroundColor: data.lowStock > 0 ? "#FFF8E1" : "#E8F5E9",
              mb: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, color: data.lowStock > 0 ? "#F57F17" : "#2E7D32" }}>
              {data.lowStock > 0
                ? `${data.lowStock} medicine${data.lowStock !== 1 ? "s" : ""} running low (${lowStockRate}% of total)`
                : "All medicines are adequately stocked"}
            </Typography>
            <Chip
              label={data.lowStock > 0 ? "Action needed" : "All clear"}
              color={data.lowStock > 0 ? "warning" : "success"}
              size="small"
            />
          </Box>

          <Typography variant="caption" color="text.secondary">
            {data.lowStock > 0
              ? "Notify pharmacy staff to restock flagged medicines to avoid disruptions."
              : "No low stock items detected. Inventory is healthy across all registered pharmacies."}
          </Typography>
        </CardContent>
      </Card>

    </Box>
  );
}