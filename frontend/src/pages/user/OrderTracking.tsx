import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface IOrder {
  _id: string;
  user: { name: string; email: string };
  pharmacy: { name: string; address: string };
  rider?: { name: string; email: string };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  paymentStatus: string;
  deliveryMethod: string;
  deliveryStatus: string;
  deliveryAddress: string;
  createdAt: string;
}

const deliverySteps = [
  { label: "Order Placed", status: "pending" },
  { label: "Preparing", status: "preparing" },
  { label: "Rider Assigned", status: "assigned" },
  { label: "Picked Up", status: "picked_up" },
  { label: "On The Way", status: "on_the_way" },
  { label: "Delivered", status: "delivered" },
];

const pickupSteps = [
  { label: "Order Placed", status: "pending" },
  { label: "Preparing", status: "preparing" },
  { label: "Ready for Pickup", status: "preparing" },
  { label: "Delivered", status: "delivered" },
];

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(false);

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/track/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // poll every 10 seconds for real-time updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const getActiveStep = (order: IOrder) => {
    if (order.deliveryMethod === "pickup") {
      if (order.status === "delivered") return 3;
      if (order.status === "preparing") return 2;
      if (order.status === "pending") return 0;
      return 1;
    }

    switch (order.deliveryStatus) {
      case "unassigned": return order.status === "preparing" ? 1 : 0;
      case "assigned": return 2;
      case "picked_up": return 3;
      case "on_the_way": return 4;
      case "delivered": return 5;
      default: return 0;
    }
  };

  const canCancel = order ? (order.status === "pending" || order.status === "preparing") : false;

  const handleConfirmCancel = async () => {
    if (!order) return;
    setCancelling(true);
    setCancelError("");
    try {
      await api.put(
        `/orders/${order._id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
      setCancelOpen(false);
    } catch (error: any) {
      console.error(error);
      setCancelError(error?.response?.data?.message || "Couldn't cancel this order. Try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <Box>
        <Skeleton variant="rounded" height={40} sx={{ mb: 2, width: 160 }} />
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={200} />
      </Box>
    );
  }

  if (!order) return <Typography sx={{ color: "text.secondary" }}>Order not found.</Typography>;

  const steps = order.deliveryMethod === "pickup" ? pickupSteps : deliverySteps;
  const activeStep = getActiveStep(order);

  return (
    <Box>
      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        sx={{ mb: 2, borderRadius: "8px" }}
        onClick={() => navigate("/user/orders")}
      >
        ← Back to Orders
      </Button>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary" }}>
          Order Tracking
        </Typography>
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setCancelOpen(true)}
            sx={{ borderRadius: "8px", fontSize: "0.78rem", flexShrink: 0 }}
          >
            Cancel order
          </Button>
        )}
      </Box>

      {/* STATUS CHIPS */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label={`Order: ${order.status.toUpperCase()}`}
          color={
            order.status === "delivered" ? "success" :
            order.status === "cancelled" ? "error" : "warning"
          }
        />
        {order.deliveryMethod === "delivery" && order.status !== "cancelled" && (
          <Chip
            label={`Delivery: ${order.deliveryStatus.replace("_", " ").toUpperCase()}`}
            color="primary"
          />
        )}
        <Chip
          label={`Payment: ${order.paymentStatus.toUpperCase()}`}
          color={order.paymentStatus === "paid" ? "success" : "default"}
          variant="outlined"
        />
      </Box>

      {/* STEPPER — hidden once cancelled, since the steps no longer apply */}
      {order.status !== "cancelled" && (
        <Card sx={{ borderRadius: "12px", mb: 2 }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, mb: 2, fontSize: "0.9rem" }}>
              Delivery Progress
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((step, index) => (
                <Step key={index} completed={index < activeStep}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* ORDER DETAILS */}
      <Card sx={{ borderRadius: "12px", mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
            Order Details
          </Typography>

          <Typography variant="body2" color="text.secondary">Pharmacy</Typography>
          <Typography sx={{ mb: 1 }}>{order.pharmacy?.name}</Typography>

          <Typography variant="body2" color="text.secondary">Address</Typography>
          <Typography sx={{ mb: 1 }}>{order.pharmacy?.address}</Typography>

          {order.deliveryMethod === "delivery" && (
            <>
              <Typography variant="body2" color="text.secondary">Deliver To</Typography>
              <Typography sx={{ mb: 1 }}>{order.deliveryAddress}</Typography>
            </>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>Items</Typography>
          {order.items.map((item) => (
            <Box
              key={item._id}
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2">
                {item.medicine?.name} x{item.quantity}
              </Typography>
              <Typography variant="body2">
                ₱{(item.price * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{order.totalPrice.toFixed(2)}</Typography>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Ordered: {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* RIDER INFO */}
      {order.rider && order.status !== "cancelled" && (
        <Card sx={{ borderRadius: "12px" }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, mb: 1, fontSize: "0.9rem" }}>
              Rider Information
            </Typography>
            <Typography variant="body2" color="text.secondary">Name</Typography>
            <Typography>{order.rider.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Email</Typography>
            <Typography>{order.rider.email}</Typography>
          </CardContent>
        </Card>
      )}

      {/* CANCEL CONFIRMATION */}
      <Dialog open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} maxWidth="xs" fullWidth>
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
          <Button onClick={() => setCancelOpen(false)} disabled={cancelling}>
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