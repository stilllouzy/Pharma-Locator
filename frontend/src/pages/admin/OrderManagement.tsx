import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IOrder {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  pharmacy: {
    name: string;
  };
  rider?: {
    _id: string;
    name: string;
  };
  totalPrice: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: string;
  deliveryStatus: string;
  deliveryMethod: string;
  createdAt: string;
}

interface IRider {
  _id: string;
  name: string;
  email: string;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [riders, setRiders] = useState<IRider[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔷 FETCH ORDERS
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter },
      });
      setOrders(res.data);
    } catch (error) {
      console.log("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔷 FETCH RIDERS
  const fetchRiders = async () => {
    try {
      const res = await api.get("/admin/riders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRiders(res.data);
    } catch (error) {
      console.log("Error fetching riders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRiders();
  }, [statusFilter]);

  // 🔷 UPDATE ORDER STATUS
  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(
        `/admin/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  // 🔷 ASSIGN RIDER
  const assignRider = async (orderId: string, riderId: string) => {
    try {
      await api.put(
        `/admin/orders/${orderId}/assign-rider`,
        { riderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Order & Reservation Management
        </Typography>
        <Typography variant="caption" color="gray">
          Track and manage all system orders
        </Typography>
      </Box>

      {/* FILTER */}
      <Box sx={{ mb: 2 }}>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          displayEmpty
          sx={{ backgroundColor: "white", minWidth: 200 }}
        >
          <MenuItem value="">All Orders</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="preparing">Preparing</MenuItem>
          <MenuItem value="delivered">Delivered</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </Box>

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading orders...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && orders.length === 0 && (
        <Typography color="gray">No orders found.</Typography>
      )}

      {/* ORDERS LIST */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {orders.map((order) => (
          <Card key={order._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              {/* INFO */}
              <Typography sx={{ fontWeight: "bold" }}>
                {order.user?.name}
              </Typography>
              <Typography variant="body2">{order.user?.email}</Typography>
              <Typography variant="body2">
                Pharmacy: {order.pharmacy?.name}
              </Typography>
              <Typography variant="body2">₱{order.totalPrice}</Typography>
              <Typography variant="body2">
                Method: {order.deliveryMethod}
              </Typography>

              {/* STATUS */}
              <Typography
                sx={{
                  fontWeight: "bold",
                  color:
                    order.status === "delivered"
                      ? "green"
                      : order.status === "cancelled"
                      ? "red"
                      : "orange",
                }}
              >
                Status: {order.status}
              </Typography>

              <Typography variant="caption" sx={{ display: "block" }}>
                Payment: {order.paymentStatus}
              </Typography>

              {/* DELIVERY STATUS — only for delivery orders */}
              {order.deliveryMethod === "delivery" && (
                <Typography variant="caption" sx={{ display: "block" }}>
                  Delivery Status: {order.deliveryStatus}
                </Typography>
              )}

              {/* RIDER INFO */}
             {order.rider && (
  <Typography variant="caption" sx={{ display: "block", color: "green" }}>
    Rider: {order.rider.name}
  </Typography>
)}

              <Divider sx={{ my: 1 }} />

              {/* ORDER STATUS ACTIONS */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => updateStatus(order._id, "preparing")}
                >
                  Preparing
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => updateStatus(order._id, "delivered")}
                >
                  Delivered
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => updateStatus(order._id, "cancelled")}
                >
                  Cancel
                </Button>
              </Box>

              {/* RIDER ASSIGNMENT — only for delivery orders */}
              {order.deliveryMethod === "delivery" && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="gray">
                    Assign Rider:
                  </Typography>
                  <Select
                    displayEmpty
                    size="small"
                    fullWidth
                    value={order.rider?._id ?? ""}
                    onChange={(e) => assignRider(order._id, e.target.value)}
                    sx={{ mt: 0.5 }}
                  >
                    <MenuItem value="">-- Select Rider --</MenuItem>
                    {riders.map((rider) => (
                      <MenuItem key={rider._id} value={rider._id}>
                        {rider.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              )}

            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}