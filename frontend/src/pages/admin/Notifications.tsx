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

export default function Notifications() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications", { // ✅ fixed endpoint
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
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            Notifications
          </Typography>
          <Typography variant="caption" color="gray">
            System alerts and updates
          </Typography>
        </Box>
        {notifications.length > 0 && (
          <Button variant="outlined" onClick={markAllRead}>
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading notifications...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && notifications.length === 0 && (
        <Typography color="gray">No notifications found.</Typography>
      )}

      {/* NOTIFICATION LIST */}
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

                  {/* TYPE BADGE */}
                  <Chip
                    label={notif.type.toUpperCase()}
                    size="small"
                    color={getTypeColor(notif.type) as any}
                    sx={{ mb: 1 }}
                  />

                  {/* TITLE */}
                  <Typography sx={{ fontWeight: "bold" }}>
                    {notif.title}
                  </Typography>

                  {/* MESSAGE */}
                  <Typography variant="body2" color="gray">
                    {notif.message}
                  </Typography>

                  {/* USER INFO */}
                  {notif.user && (
                    <Typography variant="caption" color="gray" sx={{ display: "block" }}>
                      From: {notif.user.name} ({notif.user.role})
                    </Typography>
                  )}

                  {/* DATE */}
                  <Typography variant="caption" color="gray">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>

                </Box>

                {/* UNREAD INDICATOR */}
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