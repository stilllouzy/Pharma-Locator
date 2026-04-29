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
}

export default function MedManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");

  const [newMed, setNewMed] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
  });

  const token = localStorage.getItem("token");

  // 🔷 FETCH MEDICINES
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

  // 🔷 ADD MEDICINE
  const addMedicine = async () => {
    try {
      await api.post("/medicines", newMed, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewMed({ name: "", price: "", stock: "", category: "" });
      fetchMedicines();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔷 DELETE MEDICINE
  const deleteMedicine = async (id: string) => {
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
          Manage all medicines in the system
        </Typography>
      </Box>

      {/* ADD MEDICINE */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Add Medicine
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              label="Name"
              value={newMed.name}
              onChange={(e) =>
                setNewMed({ ...newMed, name: e.target.value })
              }
            />

            <TextField
              label="Price"
              type="number"
              value={newMed.price}
              onChange={(e) =>
                setNewMed({ ...newMed, price: e.target.value })
              }
            />

            <TextField
              label="Stock"
              type="number"
              value={newMed.stock}
              onChange={(e) =>
                setNewMed({ ...newMed, stock: e.target.value })
              }
            />

            <TextField
              label="Category"
              value={newMed.category}
              onChange={(e) =>
                setNewMed({ ...newMed, category: e.target.value })
              }
            />

            <Button variant="contained" onClick={addMedicine}>
              Add
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search medicine..."
        sx={{ mb: 2 }}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                <Typography variant="caption">
                  {med.category}
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