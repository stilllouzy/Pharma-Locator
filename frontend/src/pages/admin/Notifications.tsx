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
  message: string;
  type: "system" | "order" | "user" | "pharmacy";
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔔 FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/notifications", {
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

  // ✔ MARK AS READ
  const markAsRead = async (id: string) => {
    try {
      await api.put(
        `/admin/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Notifications
        </Typography>
        <Typography variant="caption" color="gray">
          System alerts and updates
        </Typography>
      </Box>

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading notifications...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && notifications.length === 0 && (
        <Typography color="gray">
          No notifications found.
        </Typography>
      )}

      {/* NOTIFICATION LIST */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        {notifications.map((notif) => (
          <Card
            key={notif._id}
            sx={{
              borderRadius: 3,
              backgroundColor: notif.isRead ? "white" : "#e3f2fd",
            }}
          >
            <CardContent>

              {/* TYPE BADGE */}
              <Chip
                label={notif.type.toUpperCase()}
                size="small"
                color={
                  notif.type === "system"
                    ? "error"
                    : notif.type === "order"
                    ? "primary"
                    : notif.type === "user"
                    ? "success"
                    : "warning"
                }
                sx={{ mb: 1 }}
              />

              {/* MESSAGE */}
              <Typography sx={{ fontWeight: "bold" }}>
                {notif.message}
              </Typography>

              {/* DATE */}
              <Typography variant="caption" color="gray">
                {new Date(notif.createdAt).toLocaleString()}
              </Typography>

              {/* ACTION */}
              {!notif.isRead && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => markAsRead(notif._id)}
                  >
                    Mark as Read
                  </Button>
                </Box>
              )}

            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}