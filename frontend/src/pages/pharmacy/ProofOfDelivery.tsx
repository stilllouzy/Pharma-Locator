import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface INotification {
  _id: string;
  title: string;
  message: string; // this holds the base64 image
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ProofOfDelivery() {
  const [pods, setPods] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchPODs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // only show delivery type notifications (which contain the POD image)
      const deliveryNotifs = res.data.filter(
        (n: INotification) => n.type === "delivery"
      );
      setPods(deliveryNotifs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPODs();
  }, []);

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold", color : "primary.main"}}>
          Proof of Delivery
        </Typography>
        <Typography variant="caption" color="gray">
          Delivery photos submitted by riders
        </Typography>
      </Box>

      {loading && <Typography color="gray">Loading...</Typography>}

      {!loading && pods.length === 0 && (
        <Typography color="gray">No proof of delivery received yet.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {pods.map((pod) => (
          <Card key={pod._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              <Chip
                label={pod.isRead ? "SEEN" : "NEW"}
                color={pod.isRead ? "default" : "success"}
                size="small"
                sx={{ mb: 1 }}
              />

              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                {pod.title}
              </Typography>

              {/* POD IMAGE */}
              <img
                src={pod.message}
                alt="Proof of Delivery"
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  borderRadius: 8,
                }}
              />

              <Typography variant="caption" color="gray" sx={{ display: "block", mt: 1 }}>
                Received: {new Date(pod.createdAt).toLocaleString()}
              </Typography>

            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}