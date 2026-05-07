import {
  Box,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
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

export default function ReportsAnalytics() {
  const [data, setData] = useState<Analytics>({
    users: 0,
    pharmacies: 0,
    orders: 0,
    medicines: 0,
    lowStock: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });

  const token = localStorage.getItem("token");

  // 🔷 FETCH ANALYTICS DATA
  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(res.data);
    } catch (error) {
      console.log("Analytics error:", error);

      // empty safe state (NO DUMMY DATA)
      setData({
        users: 0,
        pharmacies: 0,
        orders: 0,
        medicines: 0,
        lowStock: 0,
        completedOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Reports & Analytics
        </Typography>
        <Typography variant="caption" color="gray">
          System insights and performance overview
        </Typography>
      </Box>

      {/* 📊 OVERVIEW CARDS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr 1fr 1fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <Card><CardContent>
          <Typography>Total Users</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            {data.users}
          </Typography>
        </CardContent></Card>

        <Card><CardContent>
          <Typography>Pharmacies</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            {data.pharmacies}
          </Typography>
        </CardContent></Card>

        <Card><CardContent>
          <Typography>Total Orders</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            {data.orders}
          </Typography>
        </CardContent></Card>

        <Card><CardContent>
          <Typography>Medicines</Typography>
          <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
            {data.medicines}
          </Typography>
        </CardContent></Card>
      </Box>

      {/* 📦 ORDER ANALYTICS */}
      <Card sx={{ mb: 2, borderRadius: 3 }}>
  <CardContent>
    <Typography sx={{ fontWeight: "bold", mb: 1 }}>
      Order Analytics
    </Typography>
    <Typography>Completed Orders: {data.completedOrders}</Typography>
    <Typography>Pending Orders: {data.pendingOrders}</Typography>
    <Typography>Cancelled Orders: {data.cancelledOrders}</Typography>
    <Typography>
      Total Revenue: ₱{data.totalRevenue.toLocaleString()}
    </Typography>
  </CardContent>
</Card>

      {/* 📦 INVENTORY ANALYTICS */}
      <Card sx={{ mb: 2, borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Inventory Insights
          </Typography>

          <Typography>
            Low Stock Medicines: {data.lowStock}
          </Typography>
        </CardContent>
      </Card>

      {/* 📦 INSIGHT NOTE */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold" }}>
            System Insight
          </Typography>

          <Typography variant="body2" color="gray">
            This module provides real-time system performance overview for
            administrative decision-making including order flow, inventory
            status, and pharmacy activity.
          </Typography>
        </CardContent>
      </Card>

    </Box>
  );
}