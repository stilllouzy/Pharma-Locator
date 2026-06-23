import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Skeleton,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

// ── Types ────────────────────────────────────────────────────────────────────

interface IDashboardStats {
  assigned: number;
  completedToday: number;
  cancelled: number;
}

type DeliveryStatus = "assigned" | "picked_up" | "on_the_way" | "delivered";

interface IRecentDelivery {
  _id: string;
  user: { name: string };
  deliveryAddress: string;
  pharmacy: { name: string };
  deliveryStatus: DeliveryStatus;
  updatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  DeliveryStatus,
  { label: string; color: string; chipColor: "warning" | "info" | "primary" | "success" }
> = {
  assigned:    { label: "Assigned",    color: "#F57F17", chipColor: "warning" },
  picked_up:   { label: "Picked up",   color: "#1565C0", chipColor: "info"    },
  on_the_way:  { label: "On the way",  color: "#E65100", chipColor: "primary" },
  delivered:   { label: "Delivered",   color: "#2E7D32", chipColor: "success" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
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
          <Typography
            variant="overline"
            sx={{ color: "text.disabled", letterSpacing: "0.07em" }}
          >
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
          <Skeleton variant="text" width={48} height={40} />
        ) : (
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: valueColor, lineHeight: 1 }}>
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

// ── Pipeline row ─────────────────────────────────────────────────────────────

function PipelineRow({
  label, count, total, color,
}: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, color: "text.primary", flex: "0 0 90px" }}>
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1, height: 6, backgroundColor: "#F4F7FB",
          borderRadius: 6, overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%", width: `${pct}%`,
            backgroundColor: color, borderRadius: 6,
            transition: "width 0.4s ease",
            minWidth: count > 0 ? 6 : 0,
          }}
        />
      </Box>
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", minWidth: 20, textAlign: "right" }}>
        {count}
      </Typography>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function RiderDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState<IDashboardStats>({
    assigned: 0,
    completedToday: 0,
    cancelled: 0,
  });
  const [recentDeliveries, setRecentDeliveries] = useState<IRecentDelivery[]>([]);
  const [pipeline, setPipeline] = useState({
    assigned: 0, picked_up: 0, on_the_way: 0, delivered: 0, cancelled: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  // Fetch summary stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/rider/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch active deliveries for pipeline + recent activity
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const [activeRes, historyRes] = await Promise.all([
          api.get("/rider/deliveries", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/rider/history",    { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const active: IRecentDelivery[]  = activeRes.data;
        const history: IRecentDelivery[] = historyRes.data;

        // Build pipeline counts from active orders
        const counts = { assigned: 0, picked_up: 0, on_the_way: 0, delivered: 0, cancelled: 0 };
        active.forEach((d) => {
          if (d.deliveryStatus in counts) counts[d.deliveryStatus as keyof typeof counts]++;
        });
        counts.delivered = stats.completedToday; // use accurate daily count from dashboard
        setPipeline(counts);

        // Recent activity: merge active + history, sort by updatedAt desc, take 5
        const merged = [...active, ...history]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5);
        setRecentDeliveries(merged);
      } catch (err) {
        console.error(err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchDeliveries();
  }, [stats.completedToday]);

  const pipelineTotal =
    pipeline.assigned + pipeline.picked_up + pipeline.on_the_way +
    pipeline.delivered + pipeline.cancelled;

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <DashboardOutlinedIcon sx={{ fontSize: 20, color: "primary.main" }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main" }}>
            {getGreeting()}, Rider
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">
          Here's your delivery overview for today
        </Typography>
      </Box>

      {/* ── Stat cards ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard
          label="Assigned"
          value={stats.assigned}
          footer="Active now"
          icon={<LocalShippingOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#FFF3E0"
          iconColor="#E65100"
          valueColor="#E65100"
          loading={statsLoading}
        />
        <StatCard
          label="Done today"
          value={stats.completedToday}
          footer="Delivered"
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
          valueColor="#2E7D32"
          loading={statsLoading}
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          footer="This week"
          icon={<CancelOutlinedIcon sx={{ fontSize: 18 }} />}
          iconBg="#FFEBEE"
          iconColor="#C62828"
          valueColor="#C62828"
          loading={statsLoading}
        />
      </Box>

      {/* ── Delivery pipeline ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: "text.disabled", mb: 1.25, display: "block" }}>
          Delivery pipeline
        </Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "primary.main" }}>
                Today's status breakdown
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {pipelineTotal} total
              </Typography>
            </Box>

            {statsLoading || activityLoading ? (
              [1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" height={14} sx={{ mb: 1.5, borderRadius: 6 }} />
              ))
            ) : (
              <>
                <PipelineRow label="Assigned"   count={pipeline.assigned}   total={pipelineTotal} color="#F57F17" />
                <PipelineRow label="Picked up"  count={pipeline.picked_up}  total={pipelineTotal} color="#1565C0" />
                <PipelineRow label="On the way" count={pipeline.on_the_way} total={pipelineTotal} color="#E65100" />
                <PipelineRow label="Delivered"  count={pipeline.delivered}  total={pipelineTotal} color="#2E7D32" />
                <PipelineRow label="Cancelled"  count={pipeline.cancelled}  total={pipelineTotal} color="#C62828" />
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Recent activity ── */}
      <Box>
        <Typography variant="overline" sx={{ color: "text.disabled", mb: 1.25, display: "block" }}>
          Recent activity
        </Typography>
        <Card>
          <CardContent sx={{ px: "20px", py: "16px", "&:last-child": { pb: "16px" } }}>
            {activityLoading ? (
              [1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                  <Skeleton variant="circular" width={8} height={8} sx={{ mt: "5px", flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={18} />
                    <Skeleton variant="text" width="50%" height={14} />
                  </Box>
                </Box>
              ))
            ) : recentDeliveries.length === 0 ? (
              <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                No recent activity yet.
              </Typography>
            ) : (
              recentDeliveries.map((d, idx) => {
                const meta = STATUS_META[d.deliveryStatus] ?? STATUS_META.assigned;
                const isLast = idx === recentDeliveries.length - 1;
                return (
                  <Box
                    key={d._id}
                    onClick={() => navigate(`/rider/detail/${d._id}`)}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      py: 1.25,
                      borderBottom: isLast ? "none" : "0.5px solid rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      borderRadius: 1,
                      "&:hover": { backgroundColor: "rgba(13,59,110,0.03)" },
                      transition: "background 0.15s",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8, height: 8, borderRadius: "50%",
                        backgroundColor: meta.color,
                        mt: "5px", flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.primary" }}>
                          {d.user?.name ?? "Customer"}
                        </Typography>
                        <Chip
                          label={meta.label}
                          color={meta.chipColor}
                          size="small"
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "block", mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {d.pharmacy?.name} · {d.deliveryAddress} · {formatTime(d.updatedAt)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}