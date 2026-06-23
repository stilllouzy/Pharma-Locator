import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import api from "../../api/api";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  // FETCH ORDERS
  const fetchOrders = async () => {
    const res = await api.get("/orders/pharmacy", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {
    await api.put(
      `/orders/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    fetchOrders();
  };

  return (
    <Box sx={{p:3}}>
  <Box sx={{ mb: 3 }}>
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      mb: 0.5,
    }}
  >
    <Inventory2OutlinedIcon
      sx={{
        color: "primary.main",
        fontSize: 22,
      }}
    />

    <Typography
      sx={{
        fontSize: 22,
        fontWeight: 700,
        color: "primary.main",
      }}
    >
      Orders
    </Typography>
  </Box>

  <Typography
    variant="caption"
    color="text.disabled"
  >
    Manage customer orders
  </Typography>
</Box>
      {orders.map((order) => (
  <Card
    key={order._id}
    sx={{
      mb: 2,
      borderRadius: 3,
      overflow: "hidden",
    }}
  >
    <CardContent>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: 19,
          }}
        >
          {order.user?.name}
        </Typography>

        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: "primary.main",
            textTransform: "capitalize",
          }}
        >
          {order.status}
        </Typography>
      </Box>

      {/* Delivery info */}
      <Typography variant="body2" color="text.secondary">
        Delivery: {order.deliveryMethod}
      </Typography>

      {order.deliveryAddress && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Address: {order.deliveryAddress}
        </Typography>
      )}

      {/* Medicines */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {order.items.map((item: any) => (
          <Box
            key={item._id}
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: "8px",
              backgroundColor: "#F4F7FB",
              fontSize: 12,
            }}
          >
            {item.medicine?.name} ×{item.quantity}
          </Box>
        ))}
      </Box>

      {/* Total */}
      <Typography
        sx={{
          mt: 2,
          fontSize: 18,
          fontWeight: 700,
          color: "primary.main",
        }}
      >
        ₱{order.totalPrice.toLocaleString()}
      </Typography>

      {/* Status Update */}
      <TextField
        select
        fullWidth
        size="small"
        label="Update Status"
        value={order.status}
        sx={{ mt: 2 }}
        onChange={(e) =>
          updateStatus(order._id, e.target.value)
        }
      >
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="paid">Paid</MenuItem>
        <MenuItem value="delivered">Delivered</MenuItem>
        <MenuItem value="cancelled">Cancelled</MenuItem>
      </TextField>
    </CardContent>
  </Card>
))}
    </Box>
  );
}