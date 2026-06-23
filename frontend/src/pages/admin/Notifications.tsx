import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Skeleton,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import SettingsIcon from "@mui/icons-material/Settings";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import PersonIcon from "@mui/icons-material/Person";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";

interface INotification {
  _id: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  title: string;
  message: string;
  type: "order" | "prescription" | "delivery" | "system";
  isRead: boolean;
  createdAt: string;
}

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    color: "info" | "warning" | "success" | "error";
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
  }
> = {
  order: {
    label: "Order",
    color: "info",
    icon: <ShoppingCartIcon sx={{ fontSize: 16 }} />,
    iconBg: "#E3F2FD",
    iconColor: "#1565C0",
  },
  prescription: {
    label: "Prescription",
    color: "warning",
    icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />,
    iconBg: "#FFF8E1",
    iconColor: "#F57F17",
  },
  delivery: {
    label: "Delivery",
    color: "success",
    icon: <TwoWheelerIcon sx={{ fontSize: 16 }} />,
    iconBg: "#E8F5E9",
    iconColor: "#2E7D32",
  },
  system: {
    label: "System",
    color: "error",
    icon: <SettingsIcon sx={{ fontSize: 16 }} />,
    iconBg: "#FFEBEE",
    iconColor: "#C62828",
  },
};

const DEFAULT_CONFIG = {
  label: "Notice",
  color: "info" as const,
  icon: <NotificationsNoneIcon sx={{ fontSize: 16 }} />,
  iconBg: "#EEF4FB",
  iconColor: "#0D3B6E",
};

// ─── Relative time ────────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const highlightRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.log(error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Scroll the highlighted notification into view once it's rendered.
  useEffect(() => {
    if (!highlightId || hasScrolledRef.current || loading) return;
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      hasScrolledRef.current = true;
    }
  }, [highlightId, loading, notifications]);

  // Drop the highlight after a few seconds so it doesn't linger forever,
  // and clean the query param out of the URL.
  useEffect(() => {
    if (!highlightId) return;
    const timeout = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("highlight");
        return next;
      });
    }, 4000);
    return () => clearTimeout(timeout);
  }, [highlightId, setSearchParams]);

  const markAllRead = async () => {
    try {
      await api.put(
        "/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box
        sx={{
          mb: 3,
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
            <Typography variant="h2" sx={{ fontSize: "1.4rem" }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{
                  backgroundColor: "#0D3B6E",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  height: 20,
                }}
              />
            )}
          </Box>
          <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
            System alerts and updates
          </Typography>
        </Box>

        {notifications.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={markAllRead}
            size="small"
              sx={{
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
    }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      {/* Loading skeletons */}
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={90} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <NotificationsNoneIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No notifications yet.
          </Typography>
        </Box>
      )}

      {/* Notification list */}
      {!loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;
            const isHighlighted = notif._id === highlightId;

            return (
              <Card
                key={notif._id}
                ref={isHighlighted ? highlightRef : undefined}
                sx={{
                  borderLeft: notif.isRead
                    ? "3px solid transparent"
                    : "3px solid #0D3B6E",
                  backgroundColor: notif.isRead ? "background.paper" : "#F0F5FF",
                  transition: "background-color 0.2s ease, box-shadow 0.3s ease",
                  ...(isHighlighted && {
                    boxShadow: "0 0 0 2px #5BC4A0",
                  }),
                }}
              >
                <CardContent sx={{ px: "20px !important", py: "14px !important" }}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>

                    {/* Icon */}
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        backgroundColor: config.iconBg,
                        color: config.iconColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      {config.icon}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>

                      {/* Top row: type chip + time + unread dot */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          <Chip
                            label={config.label}
                            color={config.color}
                            size="small"
                            sx={{ height: 18, fontSize: "0.65rem", fontWeight: 600 }}
                          />
                          <Typography variant="caption" color="text.disabled">
                            {relativeTime(notif.createdAt)}
                          </Typography>
                        </Box>
                        {!notif.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#0D3B6E",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>

                      {/* Title */}
                      <Typography
                        sx={{
                          fontWeight: notif.isRead ? 500 : 600,
                          fontSize: "0.88rem",
                          color: "text.primary",
                          mb: 0.25,
                        }}
                      >
                        {notif.title}
                      </Typography>

                      {/* Message */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.5, mb: notif.user && notif.user.role !== "admin" ? 0.75 : 0 }}
                      >
                        {notif.message}
                      </Typography>

                      {/* From (non-admin senders only) */}
                      {notif.user && notif.user.role !== "admin" && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PersonIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                          <Typography variant="caption" color="text.secondary">
                            {notif.user.name} · {notif.user.role}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}