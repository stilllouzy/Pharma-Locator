import { Box, Typography, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IDashboard {
  assigned: number;
  completedToday: number;
  cancelled: number;
}

export default function RiderDashboard() {
  const [stats, setStats] = useState<IDashboard>({
    assigned: 0,
    completedToday: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: "Assigned", value: stats.assigned, color: "orange" },
    { label: "Completed Today", value: stats.completedToday, color: "green" },
    { label: "Cancelled", value: stats.cancelled, color: "red" },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Rider Dashboard
        </Typography>
        <Typography variant="caption" color="gray">
          Overview of your deliveries
        </Typography>
      </Box>

      {loading ? (
        <Typography color="gray">Loading stats...</Typography>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          {statCards.map((stat) => (
            <Card key={stat.label} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="caption" color="gray">
                  {stat.label}
                </Typography>
                <Typography
                  sx={{ fontSize: 28, fontWeight: "bold", color: stat.color }}
                >
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}