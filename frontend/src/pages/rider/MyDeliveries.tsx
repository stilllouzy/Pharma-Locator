import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: "assigned" | "picked_up" | "on_the_way" | "delivered";
  status: string;
  createdAt: string;
}

export default function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<IDelivery[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/rider/deliveries", {
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
    fetchDeliveries();
  }, []);

  const updateStatus = async (id: string, deliveryStatus: string) => {
    try {
      await api.put(
        `/rider/deliveries/${id}/status`,
        { deliveryStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDeliveries();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned": return "warning";
      case "picked_up": return "info";
      case "on_the_way": return "primary";
      case "delivered": return "success";
      default: return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          My Deliveries
        </Typography>
        <Typography variant="caption" color="gray">
          Active and ongoing deliveries
        </Typography>
      </Box>

      {loading && <Typography color="gray">Loading...</Typography>}

      {!loading && deliveries.length === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography color="gray">No active deliveries yet.</Typography>
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
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={delivery.deliveryStatus.replace("_", " ").toUpperCase()}
                  color={getStatusColor(delivery.deliveryStatus) as any}
                  size="small"
                />
              </Box>

              {/* ACTION BUTTONS */}
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                {delivery.deliveryStatus === "assigned" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="info"
                    onClick={() => updateStatus(delivery._id, "picked_up")}
                  >
                    Picked Up
                  </Button>
                )}

                {delivery.deliveryStatus === "picked_up" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => updateStatus(delivery._id, "on_the_way")}
                  >
                    On The Way
                  </Button>
                )}

                {delivery.deliveryStatus === "on_the_way" && (
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => updateStatus(delivery._id, "delivered")}
                  >
                    Delivered
                  </Button>
                )}

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/rider/details/${delivery._id}`)}
                >
                  View Details
                </Button>
              </Box>

            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}