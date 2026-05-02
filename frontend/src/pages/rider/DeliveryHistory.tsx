import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IDelivery {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  pharmacy: {
    name: string;
  };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: string;
  status: string;
  createdAt: string;
}

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rider/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeliveries(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Delivery History
        </Typography>
        <Typography variant="caption" color="gray">
          Completed and cancelled deliveries
        </Typography>
      </Box>

      {loading && <Typography color="gray">Loading...</Typography>}

      {!loading && deliveries.length === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="gray">No delivery history yet.</Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {deliveries.map((delivery) => (
          <Card key={delivery._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              <Typography sx={{ fontWeight: "bold" }}>
                {delivery.user?.name}
              </Typography>
              <Typography variant="body2">{delivery.user?.email}</Typography>
              <Typography variant="body2">
                Pharmacy: {delivery.pharmacy?.name}
              </Typography>
              <Typography variant="body2">
                Address: {delivery.deliveryAddress}
              </Typography>
              <Typography variant="body2">
                Total: ₱{delivery.totalPrice}
              </Typography>

              {/* ITEMS */}
              <Typography variant="body2" sx={{ mt: 1, fontWeight: "bold" }}>
                Items:
              </Typography>
              {delivery.items.map((item) => (
                <Typography key={item._id} variant="body2">
                  - {item.medicine?.name} (x{item.quantity})
                </Typography>
              ))}

              {/* STATUS */}
              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Chip
                  label={delivery.deliveryStatus.replace("_", " ").toUpperCase()}
                  color="success"
                  size="small"
                />
                <Chip
                  label={new Date(delivery.createdAt).toLocaleDateString()}
                  variant="outlined"
                  size="small"
                />
              </Box>

            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}