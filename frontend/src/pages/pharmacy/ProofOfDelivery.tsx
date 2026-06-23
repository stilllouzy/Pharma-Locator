import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface INotification {
  _id: string;
  title: string;
  message: string;
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <ImageOutlinedIcon
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
            Proof of Delivery
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.disabled"
        >
          Delivery photos submitted by riders
        </Typography>
      </Box>

      {/* EMPTY STATE */}
      {!loading && pods.length === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <ImageOutlinedIcon
              sx={{
                fontSize: 40,
                color: "text.disabled",
                mb: 1,
              }}
            />

            <Typography color="text.secondary">
              No proof of delivery received yet.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* LIST */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {pods.map((pod) => (
          <Card
            key={pod._id}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex" }}>
              {/* Accent Bar */}
              <Box
                sx={{
                  width: 4,
                  flexShrink: 0,
                  backgroundColor: pod.isRead
                    ? "#90A4AE"
                    : "#2E7D32",
                }}
              />

              <CardContent sx={{ flex: 1 }}>
                {/* Top Row */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {pod.title}
                  </Typography>

                  <Chip
                    label={pod.isRead ? "Seen" : "New"}
                    color={
                      pod.isRead
                        ? "default"
                        : "success"
                    }
                    size="small"
                  />
                </Box>

                {/* Image */}
                <Box sx={{ mb: 2 }}>
                  <img
                    src={pod.message}
                    alt="Proof of Delivery"
                    style={{
                      width: "100%",
                      maxHeight: "350px",
                      objectFit: "contain",
                      borderRadius: "12px",
                      border:
                        "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </Box>

                {/* Date */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <AccessTimeOutlinedIcon
                    sx={{
                      fontSize: 15,
                      color: "text.disabled",
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.disabled"
                  >
                    Received{" "}
                    {new Date(
                      pod.createdAt
                    ).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}