import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";


export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    const res = await api.get("/orders/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{p:3}} >
      <Typography variant="h5" sx={{mb:2}}>
        My Orders
      </Typography>

      {orders.map((order) => (
        <Card key={order._id} sx={{ mb: 2 }}>
          <CardContent>
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

            {/* STATUS */}
            <Box sx={{mt:1}}>
              <Chip
                label={order.status.toUpperCase()}
                color={getStatusColor(order.status)}
              />
            </Box>

            {/* ITEMS */}
            <Typography sx={{mt:2}}>
              <strong>Items:</strong>
            </Typography>

            {order.items.map((item: any) => (
              <Typography key={item._id}>
                - {item.medicine?.name} (x{item.quantity})
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}