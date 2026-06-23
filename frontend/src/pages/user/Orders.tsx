import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

interface IOrderItem {
  _id: string;
  medicine: { name: string; price: number };
  quantity: number;
}

interface IOrder {
  _id: string;
  totalPrice: number;
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: string;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  items: IOrderItem[];
}

const STATUS_CONFIG: Record<
  IOrder["status"],
  { label: string; color: "warning" | "info" | "success" | "error" }
> = {
  pending: { label: "Pending", color: "warning" },
  preparing: { label: "Preparing", color: "info" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
};

export default function Orders() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<IOrder | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const canCancel = (status: IOrder["status"]) => status === "pending" || status === "preparing";

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");
    try {
      await api.put(
        `/orders/${cancelTarget._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === cancelTarget._id ? { ...o, status: "cancelled" } : o))
      );
      setCancelTarget(null);
    } catch (error: any) {
      console.error(error);
      setCancelError(error?.response?.data?.message || "Couldn't cancel this order. Try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary", mb: 0.25 }}>
          My Orders
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your orders and cancel anytime before they're delivered.
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={140} />
          ))}
        </Box>
      )}

      {!loading && orders.length === 0 && (
        <Box
          sx={{
            py: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#fff",
            borderRadius: "12px",
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No orders yet.
          </Typography>
        </Box>
      )}

      {!loading && orders.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status];
            return (
              <Card key={order._id} sx={{ borderRadius: "12px" }}>
                <CardContent sx={{ p: "16px !important" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary" }}>
                        ₱{order.totalPrice.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.deliveryMethod === "delivery" ? "Delivery" : "Pickup"}
                        {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      label={config.label}
                      color={config.color}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, mb: 1.5 }}>
                    {order.items.map((item) => (
                      <Typography key={item._id} variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                        {item.medicine?.name} × {item.quantity}
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    {order.deliveryMethod === "delivery" && order.status !== "cancelled" && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/user/track/${order._id}`)}
                        sx={{ borderRadius: "8px", fontSize: "0.75rem" }}
                      >
                        Track order
                      </Button>
                    )}
                    {canCancel(order.status) && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelTarget(order)}
                        sx={{ borderRadius: "8px", fontSize: "0.75rem" }}
                      >
                        Cancel order
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* CANCEL CONFIRMATION */}
      <Dialog open={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", fontWeight: 600 }}>Cancel this order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This can't be undone. If you already paid, the amount will be marked as refunded and the
            items will go back into stock.
          </Typography>
          {cancelError && (
            <Typography variant="caption" sx={{ color: "#C62828", display: "block", mt: 1.5 }}>
              {cancelError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelTarget(null)} disabled={cancelling}>
            Keep order
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={cancelling}
            sx={{ boxShadow: "none" }}
          >
            {cancelling ? "Cancelling..." : "Yes, cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}