import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface Medicine {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  pharmacyId: { name: string };
  pharmacy?: { name: string };
}

function StockChip({ stock }: { stock: number }) {
  if (stock === 0)
    return <Chip label="Out of stock" color="error" size="small" />;
  if (stock <= 10)
    return <Chip label={`Low stock · ${stock}`} color="warning" size="small" />;
  return <Chip label={`In stock · ${stock}`} color="success" size="small" />;
}

export default function MedManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await api.get("/medicines", {
        params: { search },
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  const deleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await api.delete(`/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedicines();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh" }}>

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ fontSize: "1.4rem", mb: 0.25 }}>
          Medicine Management
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: "0.83rem" }}>
          Monitor all medicines across all pharmacies
        </Typography>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by name, category, or pharmacy..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2.5 }}
        slotProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading skeletons */}
      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={88} />
          ))}
        </Box>
      )}

      {/* Empty state */}
      {!loading && medicines.length === 0 && (
        <Box
          sx={{
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <MedicalServicesIcon sx={{ fontSize: 40, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No medicines found.
          </Typography>
          {search && (
            <Typography variant="caption" color="text.disabled">
              Try a different search term.
            </Typography>
          )}
        </Box>
      )}

      {/* Medicine list */}
      {!loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {medicines.map((med) => (
            <Card key={med._id}>
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  py: "14px !important",
                  px: "20px !important",
                }}
              >
                {/* Left: info */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: "#EEF4FB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0D3B6E",
                      flexShrink: 0,
                    }}
                  >
                    <MedicalServicesIcon sx={{ fontSize: 18 }} />
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: "text.primary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {med.name}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.25,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        ₱{med.price.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>·</Typography>
                      <Chip
                        label={med.category}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.68rem",
                          backgroundColor: "#EEF4FB",
                          color: "#0D3B6E",
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: "text.disabled" }}>·</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocalPharmacyIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {med.pharmacy?.name ?? med.pharmacyId?.name ?? "Unknown"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Right: stock + delete */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    flexShrink: 0,
                  }}
                >
                  <StockChip stock={med.stock} />
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon sx={{ fontSize: "16px !important" }} />}
                    onClick={() => deleteMedicine(med._id)}
                    sx={{
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      borderWidth: "0.5px",
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}