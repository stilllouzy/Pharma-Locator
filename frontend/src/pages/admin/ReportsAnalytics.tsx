import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
} from "@mui/material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
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
import DownloadIcon from "@mui/icons-material/Download";
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
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 88 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
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
          <Typography
            sx={{
              display: "block",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "text.secondary",
              whiteSpace: "nowrap",
              lineHeight: 1.4,
            }}
          >
            {label}
          </Typography>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
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
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.25 }}>
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

// ─── PDF Generator ────────────────────────────────────────────────────────────
async function generatePDF(data: Analytics) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const completionRate =
    data.orders > 0 ? Math.round((data.completedOrders / data.orders) * 100) : 0;
  const cancellationRate =
    data.orders > 0 ? Math.round((data.cancelledOrders / data.orders) * 100) : 0;
  const lowStockRate =
    data.medicines > 0 ? Math.round((data.lowStock / data.medicines) * 100) : 0;

  // ── Header banner ──
  doc.setFillColor(13, 59, 110);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reports & Analytics", 14, 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 210, 255);
  doc.text("System insights and performance overview", 14, 20);
  doc.text(`Generated: ${dateStr} at ${timeStr}`, 14, 26);

  let y = 42;

  const sectionTitle = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(13, 59, 110);
    doc.text(title, 14, y);
    doc.setDrawColor(13, 59, 110);
    doc.setLineWidth(0.4);
    doc.line(14, y + 1.5, pageW - 14, y + 1.5);
    y += 8;
  };

  // ── Overview ──
  sectionTitle("Overview");
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value"]],
    body: [
      ["Total Users", String(data.users)],
      ["Pharmacies", String(data.pharmacies)],
      ["Total Orders", String(data.orders)],
      ["Medicines", String(data.medicines)],
    ],
    headStyles: { fillColor: [13, 59, 110], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [238, 244, 251] },
    columnStyles: { 1: { fontStyle: "bold" } },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Revenue ──
  sectionTitle("Revenue");
  doc.setFillColor(238, 244, 251);
  doc.roundedRect(14, y, pageW - 28, 18, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(13, 59, 110);
  doc.text(`PHP ${data.totalRevenue.toLocaleString()}`, 20, y + 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `From ${data.completedOrders} completed order${data.completedOrders !== 1 ? "s" : ""}`,
    20,
    y + 15.5
  );
  y += 26;

  // ── Order Breakdown ──
  sectionTitle("Order Breakdown");
  const orderPct = (n: number) =>
    data.orders > 0 ? `${Math.round((n / data.orders) * 100)}%` : "0%";

  autoTable(doc, {
    startY: y,
    head: [["Status", "Count", "Percentage"]],
    body: [
      ["Completed", String(data.completedOrders), orderPct(data.completedOrders)],
      ["Pending", String(data.pendingOrders), orderPct(data.pendingOrders)],
      ["Cancelled", String(data.cancelledOrders), orderPct(data.cancelledOrders)],
      ["Total", String(data.orders), "100%"],
    ],
    headStyles: { fillColor: [21, 101, 192], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [227, 242, 253] },
    columnStyles: { 1: { fontStyle: "bold", halign: "center" }, 2: { halign: "center" } },
    didParseCell: (hookData: Parameters<NonNullable<Parameters<typeof autoTable>[1]["didParseCell"]>>[0]) => {
      if (hookData.section === "body") {
        const status = hookData.row.cells[0]?.raw as string;
        if (status === "Completed") hookData.cell.styles.textColor = [46, 125, 50];
        if (status === "Cancelled") hookData.cell.styles.textColor = [198, 40, 40];
        if (status === "Pending") hookData.cell.styles.textColor = [245, 127, 23];
        if (status === "Total") hookData.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Performance Metrics ──
  sectionTitle("Performance Metrics");
  autoTable(doc, {
    startY: y,
    head: [["Metric", "Value", "Status"]],
    body: [
      ["Order Completion Rate", `${completionRate}%`, completionRate >= 70 ? "Healthy" : "Needs Attention"],
      ["Cancellation Rate", `${cancellationRate}%`, cancellationRate <= 10 ? "Normal" : "High"],
      ["Low Stock Ratio", `${lowStockRate}% of medicines`, lowStockRate === 0 ? "All Stocked" : lowStockRate <= 20 ? "Moderate" : "Critical"],
    ],
    headStyles: { fillColor: [13, 59, 110], textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [30, 30, 30] },
    alternateRowStyles: { fillColor: [238, 244, 251] },
    columnStyles: { 1: { fontStyle: "bold" }, 2: { halign: "center" } },
    didParseCell: (hookData: Parameters<NonNullable<Parameters<typeof autoTable>[1]["didParseCell"]>>[0]) => {
      if (hookData.section === "body" && hookData.column.index === 2) {
        const status = hookData.cell.raw as string;
        if (["Healthy", "Normal", "All Stocked"].includes(status))
          hookData.cell.styles.textColor = [46, 125, 50];
        else if (["Needs Attention", "Moderate"].includes(status))
          hookData.cell.styles.textColor = [245, 127, 23];
        else
          hookData.cell.styles.textColor = [198, 40, 40];
        hookData.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
    theme: "grid",
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Inventory Insights ──
  sectionTitle("Inventory Insights");
  const invFill: [number, number, number] = data.lowStock > 0 ? [255, 248, 225] : [232, 245, 233];
  const invText: [number, number, number] = data.lowStock > 0 ? [245, 127, 23] : [46, 125, 50];
  doc.setFillColor(...invFill);
  doc.roundedRect(14, y, pageW - 28, 20, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...invText);
  const invMsg =
    data.lowStock > 0
      ? `${data.lowStock} medicine${data.lowStock !== 1 ? "s" : ""} running low (${lowStockRate}% of total)`
      : "All medicines are adequately stocked";
  doc.text(invMsg, 20, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const invNote =
    data.lowStock > 0
      ? "Notify pharmacy staff to restock flagged medicines to avoid disruptions."
      : "No low stock items detected. Inventory is healthy across all registered pharmacies.";
  doc.text(invNote, 20, y + 14.5);

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Page ${i} of ${pageCount}  •  MediFind Admin — Confidential`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" }
    );
  }

  const fileName = `analytics-report-${now.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsAnalytics() {
  const [data, setData] = useState<Analytics>(EMPTY);
  const [generating, setGenerating] = useState(false);

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

  const handleGenerateFile = async () => {
    setGenerating(true);
    try {
      await generatePDF(data);
    } finally {
      setGenerating(false);
    }
  };

  const completionRate =
    data.orders > 0 ? Math.round((data.completedOrders / data.orders) * 100) : 0;
  const cancellationRate =
    data.orders > 0 ? Math.round((data.cancelledOrders / data.orders) * 100) : 0;
  const lowStockRate =
    data.medicines > 0 ? Math.round((data.lowStock / data.medicines) * 100) : 0;

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.25 }}>
          <BarChartOutlinedIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography variant="h2" sx={{ fontSize: "1.4rem", fontWeight: 700, color: "primary.main" }}>
            Reports & Analytics
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: "0.83rem", textAlign: "center" }}>
          System insights and performance overview
        </Typography>

        {/* Generate File Button */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5 }}>
          <Button
            variant="contained"
            startIcon={
              generating ? (
                <CircularProgress size={16} sx={{ color: "inherit" }} />
              ) : (
                <DownloadIcon fontSize="small" />
              )
            }
            disabled={generating}
            onClick={handleGenerateFile}
            sx={{
              background: "linear-gradient(135deg, #0D3B6E 0%, #1565C0 100%)",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 2.5,
              py: 0.9,
              boxShadow: "0 2px 8px rgba(13,59,110,0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #0a2d56 0%, #0d4fa3 100%)",
                boxShadow: "0 4px 12px rgba(13,59,110,0.35)",
              },
              "&:disabled": { opacity: 0.65 },
            }}
          >
            {generating ? "Generating..." : "Generate File"}
          </Button>
        </Box>
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

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 2 }}>
        {/* Revenue highlight */}
        <Card sx={{ background: "linear-gradient(135deg, #0D3B6E 0%, #1565C0 100%)", color: "#fff" }}>
          <CardContent>
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
          <CardContent>
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
            <MetricRow label="Order completion rate" value={`${completionRate}%`} chip={completionRate >= 70 ? { label: "Healthy", color: "success" } : { label: "Needs attention", color: "warning" }} />
            <Divider />
            <MetricRow label="Cancellation rate" value={`${cancellationRate}%`} chip={cancellationRate <= 10 ? { label: "Normal", color: "success" } : { label: "High", color: "error" }} />
            <Divider />
            <MetricRow label="Low stock ratio" value={`${lowStockRate}% of medicines`} chip={lowStockRate === 0 ? { label: "All stocked", color: "success" } : lowStockRate <= 20 ? { label: "Moderate", color: "warning" } : { label: "Critical", color: "error" }} />
          </CardContent>
        </Card>
      </Box>

      {/* Order breakdown */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
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
          <OrderBar label="Completed" value={data.completedOrders} total={data.orders} color="#2E7D32" icon={<CheckCircleIcon sx={{ fontSize: 16 }} />} />
          <OrderBar label="Pending" value={data.pendingOrders} total={data.orders} color="#F57F17" icon={<HourglassEmptyIcon sx={{ fontSize: 16 }} />} />
          <OrderBar label="Cancelled" value={data.cancelledOrders} total={data.orders} color="#C62828" icon={<CancelIcon sx={{ fontSize: 16 }} />} />
        </CardContent>
      </Card>

      {/* Inventory insights */}
      <Card>
        <CardContent>
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
            <Chip label={data.lowStock > 0 ? "Action needed" : "All clear"} color={data.lowStock > 0 ? "warning" : "success"} size="small" />
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