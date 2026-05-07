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
  status: string;
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

  if (loading && !order) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!order) return <Typography sx={{ p: 3 }}>Order not found.</Typography>;

  const steps = order.deliveryMethod === "pickup" ? pickupSteps : deliverySteps;
  const activeStep = getActiveStep(order);

  return (
    <Box sx={{ p: 3 }}>

      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/user/orders")}
      >
        ← Back to Orders
      </Button>

      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 2 }}>
        Order Tracking
      </Typography>

      {/* STATUS CHIPS */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label={`Order: ${order.status.toUpperCase()}`}
          color={
            order.status === "delivered" ? "success" :
            order.status === "cancelled" ? "error" : "warning"
          }
        />
        {order.deliveryMethod === "delivery" && (
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

      {/* STEPPER */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 2 }}>
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

      {/* ORDER DETAILS */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>

          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Order Details
          </Typography>

          <Typography variant="body2" color="gray">Pharmacy</Typography>
          <Typography sx={{ mb: 1 }}>{order.pharmacy?.name}</Typography>

          <Typography variant="body2" color="gray">Address</Typography>
          <Typography sx={{ mb: 1 }}>{order.pharmacy?.address}</Typography>

          {order.deliveryMethod === "delivery" && (
            <>
              <Typography variant="body2" color="gray">Deliver To</Typography>
              <Typography sx={{ mb: 1 }}>{order.deliveryAddress}</Typography>
            </>
          )}

          <Divider sx={{ my: 1 }} />

          <Typography sx={{ fontWeight: "bold", mb: 1 }}>Items</Typography>
          {order.items.map((item) => (
            <Box
              key={item._id}
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2">
                {item.medicine?.name} x{item.quantity}
              </Typography>
              <Typography variant="body2">
                ₱{item.price * item.quantity}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
            <Typography sx={{ fontWeight: "bold" }}>₱{order.totalPrice}</Typography>
          </Box>

          <Typography variant="caption" color="gray" sx={{ display: "block", mt: 1 }}>
            Ordered: {new Date(order.createdAt).toLocaleString()}
          </Typography>

        </CardContent>
      </Card>

      {/* RIDER INFO */}
      {order.rider && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Rider Information
            </Typography>
            <Typography variant="body2" color="gray">Name</Typography>
            <Typography>{order.rider.name}</Typography>
            <Typography variant="body2" color="gray" sx={{ mt: 1 }}>Email</Typography>
            <Typography>{order.rider.email}</Typography>
          </CardContent>
        </Card>
      )}

    </Box>
  );
}