import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface INotification {
  _id: string;
  title: string;
  message: string;
  type: "order" | "prescription" | "delivery" | "system";
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put(
        "/notifications/read-all",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "order": return "primary";
      case "prescription": return "warning";
      case "delivery": return "success";
      case "system": return "error";
      default: return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Box sx={{ mb: 2, position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: "bold",  color : "primary.main" }}>
            Notifications
          </Typography>
          <Typography variant="caption" color="gray">
            Your order and delivery updates
          </Typography>
        </Box>
        {notifications.length > 0 && (
          <Button variant="outlined" onClick={markAllRead} sx={{
        position: "absolute",
        right: 0,
      }}>
            Mark All as Read
          </Button>
        )}
      </Box>

      {loading && <Typography color="gray">Loading...</Typography>}

      {!loading && notifications.length === 0 && (
        <Typography color="gray">No notifications yet.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {notifications.map((notif) => (
          <Card
            key={notif._id}
            sx={{
              borderRadius: 3,
              backgroundColor: notif.isRead ? "white" : "#e3f2fd",
              borderLeft: notif.isRead ? "none" : "4px solid #2563eb",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                  <Chip
                    label={notif.type.toUpperCase()}
                    size="small"
                    color={getTypeColor(notif.type) as any}
                    sx={{ mb: 1 }}
                  />
                  <Typography sx={{ fontWeight: "bold" }}>
                    {notif.title}
                  </Typography>
                  <Typography variant="body2" color="gray">
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="gray">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                {!notif.isRead && (
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: "#2563eb",
                      mt: 1,
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}