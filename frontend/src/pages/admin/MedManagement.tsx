import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface Medicine {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  pharmacyId: {
    name: string;
  };
}

export default function MedManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  // 🔷 FETCH ALL MEDICINES
  const fetchMedicines = async () => {
    try {
      const res = await api.get("/medicines", {
        params: { search },
        headers: { Authorization: `Bearer ${token}` },
      });

      setMedicines(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [search]);

  // 🔷 DELETE MEDICINE
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
    <Box>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Medicine Management
        </Typography>
        <Typography variant="caption" color="gray">
          Monitor all medicines across all pharmacies
        </Typography>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search medicine..."
        sx={{ mb: 2 }}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* EMPTY STATE */}
      {medicines.length === 0 && (
        <Typography color="gray">No medicines found.</Typography>
      )}

      {/* MEDICINE LIST */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {medicines.map((med) => (
          <Card key={med._id}>
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: "bold" }}>
                  {med.name}
                </Typography>
                <Typography variant="body2">
                  ₱{med.price} | Stock: {med.stock}
                </Typography>
                <Typography variant="caption" sx={{ display: "block" }}>
                  {med.category}
                </Typography>
                <Typography variant="caption" color="gray">
  Pharmacy: {(med as any).pharmacy?.name ?? "Unknown"}
</Typography>
              </Box>

              <Button
                color="error"
                onClick={() => deleteMedicine(med._id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}