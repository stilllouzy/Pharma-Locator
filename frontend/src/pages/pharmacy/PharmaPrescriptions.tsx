import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IPrescription {
  _id: string;
  user: { name: string; email: string };
  status: "pending" | "approved" | "rejected";
  imageUrl: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  const token = localStorage.getItem("token");

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions/pharmacy", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrescriptions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.put(
        `/prescriptions/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPrescriptions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(
        `/prescriptions/${id}/reject`,
        { rejectionReason: rejectionReason[id] || "Invalid prescription" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPrescriptions();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Prescription Verification
        </Typography>
        <Typography variant="caption" color="gray">
          Review and verify customer prescriptions
        </Typography>
      </Box>

      {prescriptions.length === 0 && (
        <Typography color="gray">No prescriptions to review.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {prescriptions.map((p) => (
          <Card key={p._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              <Typography sx={{ fontWeight: "bold" }}>
                {p.user?.name}
              </Typography>
              <Typography variant="body2">{p.user?.email}</Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    p.status === "approved"
                      ? "green"
                      : p.status === "rejected"
                      ? "red"
                      : "orange",
                  fontWeight: "bold",
                  mb: 1,
                }}
              >
                Status: {p.status.toUpperCase()}
              </Typography>

              {/* PRESCRIPTION IMAGE */}
              <img
                src={p.imageUrl}
                alt="Prescription"
                style={{ width: "100%", maxHeight: 250, objectFit: "contain", borderRadius: 8 }}
              />

              <Typography variant="caption" color="gray" sx={{ display: "block", mb: 1 }}>
                Uploaded: {new Date(p.createdAt).toLocaleDateString()}
              </Typography>

              {/* ACTIONS — only for pending */}
              {p.status === "pending" && (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Rejection reason (if rejecting)"
                    sx={{ mb: 1 }}
                    onChange={(e) =>
                      setRejectionReason({ ...rejectionReason, [p._id]: e.target.value })
                    }
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleApprove(p._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleReject(p._id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              )}

            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}