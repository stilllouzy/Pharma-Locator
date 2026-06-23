import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
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

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "warning" as const,
    accent: "#F57C00",
  },
  approved: {
    label: "Approved",
    color: "success" as const,
    accent: "#2E7D32",
  },
  rejected: {
    label: "Rejected",
    color: "error" as const,
    accent: "#D32F2F",
  },
};

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [rejectionReason, setRejectionReason] = useState<{
    [key: string]: string;
  }>({});

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        {
          rejectionReason:
            rejectionReason[id] || "Invalid prescription",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <DescriptionOutlinedIcon
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
            Prescription Verification
          </Typography>
        </Box>

        <Typography
          variant="caption"
          color="text.disabled"
        >
          Review and verify customer prescriptions
        </Typography>
      </Box>

      {prescriptions.length === 0 && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <DescriptionOutlinedIcon
              sx={{
                fontSize: 40,
                color: "text.disabled",
                mb: 1,
              }}
            />

            <Typography color="text.secondary">
              No prescriptions to review.
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {prescriptions.map((p) => {
          const config = STATUS_CONFIG[p.status];

          return (
            <Card
              key={p._id}
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
                    backgroundColor: config.accent,
                    flexShrink: 0,
                  }}
                />

                <CardContent sx={{ flex: 1 }}>
                  {/* Header */}
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
                      {p.user?.name}
                    </Typography>

                    <Chip
                      label={config.label}
                      color={config.color}
                      size="small"
                    />
                  </Box>

                  {/* User Info */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <PersonOutlineOutlinedIcon
                      sx={{
                        fontSize: 15,
                        color: "text.disabled",
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {p.user?.name}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <EmailOutlinedIcon
                      sx={{
                        fontSize: 15,
                        color: "text.disabled",
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {p.user?.email}
                    </Typography>
                  </Box>

                  {/* Prescription Image */}
                  <Box
                    sx={{
                      mt: 2,
                      mb: 2,
                    }}
                  >
                    <img
                      src={p.imageUrl}
                      alt="Prescription"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                  </Box>

                  {/* Upload Date */}
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
                      Uploaded{" "}
                      {new Date(
                        p.createdAt
                      ).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Rejection Reason */}
                  {p.status === "rejected" &&
                    p.rejectionReason && (
                      <Typography
                        sx={{
                          mt: 2,
                          color: "error.main",
                          fontSize: 13,
                        }}
                      >
                        Reason: {p.rejectionReason}
                      </Typography>
                    )}

                  {/* Actions */}
                  {p.status === "pending" && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Reason if rejecting..."
                        sx={{ mb: 1.5 }}
                        onChange={(e) =>
                          setRejectionReason({
                            ...rejectionReason,
                            [p._id]: e.target.value,
                          })
                        }
                      />

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() =>
                            handleApprove(p._id)
                          }
                        >
                          Approve
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          onClick={() =>
                            handleReject(p._id)
                          }
                        >
                          Reject
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}