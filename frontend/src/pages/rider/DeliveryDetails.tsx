import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface IDelivery {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  pharmacy: {
    name: string;
    address: string;
  };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  createdAt: string;
}

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<IDelivery | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rider/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDelivery(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!delivery) return <Typography sx={{ p: 3 }}>Delivery not found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>

      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/rider/deliveries")}
      >
        ← Back to Deliveries
      </Button>

      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 2 }}>
        Delivery Details
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>

          {/* STATUS */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip
              label={delivery.deliveryStatus.replace("_", " ").toUpperCase()}
              color="primary"
              size="small"
            />
            <Chip
              label={delivery.status.toUpperCase()}
              color="warning"
              size="small"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* CUSTOMER INFO */}
          <Typography sx={{ fontWeight: "bold" }}>Customer</Typography>
          <Typography variant="body2">{delivery.user?.name}</Typography>
          <Typography variant="body2">{delivery.user?.email}</Typography>

          <Divider sx={{ my: 2 }} />

          {/* PHARMACY INFO */}
          <Typography sx={{ fontWeight: "bold" }}>Pickup From</Typography>
          <Typography variant="body2">{delivery.pharmacy?.name}</Typography>
          <Typography variant="body2">{delivery.pharmacy?.address}</Typography>

          <Divider sx={{ my: 2 }} />

          {/* DELIVERY ADDRESS */}
          <Typography sx={{ fontWeight: "bold" }}>Deliver To</Typography>
          <Typography variant="body2">{delivery.deliveryAddress}</Typography>

          {/* GET DIRECTIONS BUTTON */}
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.deliveryAddress)}`}
            target="_blank"
          >
            Get Directions
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* ITEMS */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>Items</Typography>
          {delivery.items.map((item) => (
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

          <Divider sx={{ my: 2 }} />

          {/* TOTAL */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
            <Typography sx={{ fontWeight: "bold" }}>
              ₱{delivery.totalPrice}
            </Typography>
          </Box>

          <Typography variant="caption" color="gray" sx={{ display: "block", mt: 1 }}>
            Payment: {delivery.paymentStatus}
          </Typography>

          <Typography variant="caption" color="gray" sx={{ display: "block" }}>
            Ordered: {new Date(delivery.createdAt).toLocaleDateString()}
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}