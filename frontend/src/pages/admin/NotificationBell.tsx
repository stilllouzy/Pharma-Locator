import {
  Box,
  Typography,
  IconButton,
  Badge,
  Popover,
  Divider,
  Chip,
  Tooltip,
  List,
  ListItem,
  Button,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import SettingsIcon from "@mui/icons-material/Settings";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface INotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "prescription" | "delivery" | "system";
  isRead: boolean;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  order: {
    icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 15 }} />,
    bg: "#E3F2FD",
    color: "#1565C0",
  },
  delivery: {
    icon: <TwoWheelerIcon sx={{ fontSize: 15 }} />,
    bg: "#E8F5E9",
    color: "#2E7D32",
  },
  prescription: {
    icon: <MedicalServicesIcon sx={{ fontSize: 15 }} />,
    bg: "#FFF8E1",
    color: "#F57F17",
  },
  system: {
    icon: <SettingsIcon sx={{ fontSize: 15 }} />,
    bg: "#FFEBEE",
    color: "#C62828",
  },
};

const DEFAULT_CONFIG = {
  icon: <NotificationsNoneIcon sx={{ fontSize: 15 }} />,
  bg: "#EEF4FB",
  color: "#0D3B6E",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await api.put(
        "/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const handleNotifClick = () => {
    setAnchorEl(null);
    navigate("/admin/notifications");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const preview = notifications.slice(0, 5);
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            border: "0.5px solid rgba(0,0,0,0.10)",
            borderRadius: "10px",
            width: 36,
            height: 36,
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={9}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                minWidth: 16,
                height: 16,
                padding: "0 3px",
              },
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 19, color: "text.secondary" }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            borderRadius: "12px",
            border: "0.5px solid rgba(0,0,0,0.08)",
            boxShadow: "0 8px 32px rgba(13,59,110,0.12)",
            mt: 1,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary" }}
            >
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} new`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  backgroundColor: "#0D3B6E",
                  color: "#fff",
                }}
              />
            )}
          </Box>

          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={markAllRead}>
                <DoneAllIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        {/* Notification list */}
        {preview.length === 0 ? (
          <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <NotificationsNoneIcon sx={{ fontSize: 36, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {preview.map((notif, index) => {
              const config = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;
              return (
                <Box key={notif._id}>
                  <ListItem
                    onClick={handleNotifClick}
                    sx={{
                      px: 2,
                      py: 1.25,
                      cursor: "pointer",
                      backgroundColor: notif.isRead
                        ? "transparent"
                        : "rgba(13,59,110,0.03)",
                      "&:hover": { backgroundColor: "rgba(13,59,110,0.05)" },
                      gap: 1.5,
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Type icon */}
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "8px",
                        backgroundColor: config.bg,
                        color: config.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      {config.icon}
                    </Box>

                    {/* Text */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: notif.isRead ? 500 : 600,
                          fontSize: "0.82rem",
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notif.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {relativeTime(notif.createdAt)}
                      </Typography>
                    </Box>

                    {/* Unread dot */}
                    {!notif.isRead && (
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: "#0D3B6E",
                          flexShrink: 0,
                          mt: 0.75,
                        }}
                      />
                    )}
                  </ListItem>

                  {index < preview.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}

        <Divider />

        {/* Footer */}
        <Box sx={{ px: 2, py: 1.25 }}>
          <Button
            fullWidth
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
            onClick={handleNotifClick}
            sx={{ fontSize: "0.8rem", color: "#0D3B6E", fontWeight: 500 }}
          >
            See all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
}