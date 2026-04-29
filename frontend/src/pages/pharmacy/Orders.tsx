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
      <Typography variant="h5">
        Orders
      </Typography>

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography>
              <strong>Customer:</strong> {order.user?.name}
            </Typography>

            <Typography>
              <strong>Total:</strong> ₱{order.totalPrice}
            </Typography>

            <Typography>
              <strong>Delivery:</strong> {order.deliveryMethod}
            </Typography>

            {order.deliveryAddress && (
              <Typography>
                <strong>Address:</strong> {order.deliveryAddress}
              </Typography>
            )}

            <Typography>
              <strong>Medicines:</strong>
            </Typography>

            {order.items.map((item: any) => (
              <Typography key={item._id}>
                - {item.medicine?.name} (x{item.quantity})
              </Typography>
            ))}

            {/* STATUS UPDATE */}
            <TextField
              select
              label="Status"
              value={order.status}
              sx={{ mt: 2 }}
              onChange={(e) => updateStatus(order._id, e.target.value)}
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