import { Box, Typography, Card, CardContent } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface DashboardData {
  users: number;
  pharmacies: number;
  medicines: number;
  orders: number;
  lowStock: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  if (!data) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Admin Dashboard
        </Typography>
        <Typography variant="caption" color="gray">
          System overview and monitoring
        </Typography>
      </Box>

      {/* KPI CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(5, 1fr)",
          },
          gap: 2,
        }}
      >
        <Card><CardContent>Users: {data.users}</CardContent></Card>
        <Card><CardContent>Pharmacies: {data.pharmacies}</CardContent></Card>
        <Card><CardContent>Medicines: {data.medicines}</CardContent></Card>
        <Card><CardContent>Orders: {data.orders}</CardContent></Card>
        <Card><CardContent>Low Stock: {data.lowStock}</CardContent></Card>
      </Box>

      {/* STATUS SECTION */}
      <Box
        sx={{
          mt: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >

        {/* ORDER STATUS */}
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Order Status
            </Typography>

            <Typography>Pending: {data.pendingOrders}</Typography>
            <Typography>Completed: {data.completedOrders}</Typography>
          </CardContent>
        </Card>

        {/* SYSTEM INSIGHTS */}
        <Card>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              System Insights
            </Typography>

            <Typography>⚠ Low stock items: {data.lowStock}</Typography>
            <Typography>✔ System status: Active</Typography>
            <Typography>📦 Orders processing: Normal</Typography>
          </CardContent>
        </Card>

      </Box>

    </Box>
  );
}