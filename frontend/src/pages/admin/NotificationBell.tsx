import { useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  Typography,
  Divider,
  Button,
  Skeleton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import api from "../api/api";

interface INotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "prescription" | "delivery" | "system";
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  INotification["type"],
  { icon: typeof ShoppingBagOutlinedIcon; color: string; bg: string }
> = {
  order: { icon: ShoppingBagOutlinedIcon, color: "#1565C0", bg: "#E3F2FD" },
  prescription: { icon: ReceiptLongOutlinedIcon, color: "#2E7D32", bg: "#E8F5E9" },
  delivery: { icon: LocalShippingOutlinedIcon, color: "#E65100", bg: "#FFF3E0" },
  system: { icon: InfoOutlinedIcon, color: "#6A1B9A", bg: "#F3E5F5" },
};

const POLL_INTERVAL_MS = 30_000;

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/notifications/unread-count", authHeader);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.log(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/my", authHeader);
      setNotifications(res.data);
      setLoaded(true);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Poll unread count regardless of dropdown state
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const handleOpen = () => {
    setOpen(true);
    fetchNotifications();
  };

  const handleClose = () => setOpen(false);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/notifications/read-all", {}, authHeader);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.log(err);
    }
  };

  const handleNotificationClick = async (notif: INotification) => {
    if (!notif.isRead) {
      try {
        await api.put(`/notifications/${notif._id}/read`, {}, authHeader);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.log(err);
      }
    }
    setOpen(false);
    navigate(`/admin/notifications?highlight=${notif._id}`);
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate("/admin/notifications");
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          width: 36,
          height: 36,
          border: "0.5px solid rgba(13,59,110,0.16)",
          borderRadius: "8px",
          color: "text.secondary",
        }}
      >
        <Badge
          color="error"
          variant={unreadCount > 0 ? "standard" : undefined}
          badgeContent={unreadCount > 0 ? unreadCount : undefined}
          max={9}
          overlap="circular"
        >
          <NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxHeight: 480,
              mt: 1,
              borderRadius: "12px",
              border: "0.5px solid rgba(13,59,110,0.12)",
              boxShadow: "0 8px 28px rgba(13,59,110,0.14)",
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "text.primary" }}>
            Notifications
          </Typography>
          <Button
            size="small"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            sx={{ fontSize: "0.72rem", textTransform: "none", minWidth: 0, p: 0.5 }}
          >
            Mark all as read
          </Button>
        </Box>

        <Divider />

        {/* List */}
        <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
          {loading && !loaded && (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Box>
          )}

          {!loading && loaded && notifications.length === 0 && (
            <Box
              sx={{
                py: 6,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
              <Typography variant="body2" color="text.secondary">
                You're all caught up.
              </Typography>
            </Box>
          )}

          {!loading &&
            notifications.map((notif) => {
              const config = TYPE_CONFIG[notif.type];
              const Icon = config.icon;
              return (
                <Box
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.25,
                    px: 2,
                    py: 1.25,
                    cursor: "pointer",
                    backgroundColor: notif.isRead ? "transparent" : "#F4F7FB",
                    "&:hover": { backgroundColor: "#EEF4FB" },
                    borderBottom: "0.5px solid rgba(13,59,110,0.08)",
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      backgroundColor: config.bg,
                      color: config.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 16 }} />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: notif.isRead ? 500 : 700,
                          color: "text.primary",
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notif.title}
                      </Typography>
                      {!notif.isRead && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: "#5BC4A0",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled", fontSize: "0.68rem" }}>
                      {timeAgo(notif.createdAt)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
        </Box>

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={handleViewAll}
            sx={{ fontSize: "0.78rem", textTransform: "none" }}
          >
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}