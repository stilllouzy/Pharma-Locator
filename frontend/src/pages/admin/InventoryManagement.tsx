import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IMedicine {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  pharmacy: {
    _id: string;
    name: string;
  };
}

interface IPharmacy {
  _id: string;
  name: string;
}

export default function InventoryManagement() {
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔷 FETCH PHARMACIES
  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/admin/pharmacies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPharmacies(res.data);
    } catch (error) {
      console.log(error);
      setPharmacies([]);
    }
  };

  // 🔷 FETCH MEDICINES (INVENTORY)
  const fetchMedicines = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/medicines", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          pharmacyId: selectedPharmacy,
        },
      });

      setMedicines(res.data);
    } catch (error) {
      console.log(error);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [search, selectedPharmacy]);

  // 🔷 UPDATE STOCK
  const updateStock = async (id: string, stock: number) => {
    try {
      await api.put(
        `/admin/medicines/${id}/stock`,
        { stock },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchMedicines();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Inventory Management
        </Typography>
        <Typography variant="caption" color="gray">
          Monitor and manage medicine stock levels
        </Typography>
      </Box>

      {/* FILTERS */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >

        <TextField
          placeholder="Search medicine..."
          onChange={(e) => setSearch(e.target.value)}
          sx={{ backgroundColor: "white", borderRadius: 2, flex: 1 }}
        />

        <Select
          value={selectedPharmacy}
          onChange={(e) => setSelectedPharmacy(e.target.value)}
          displayEmpty
          sx={{ backgroundColor: "white", minWidth: 200 }}
        >
          <MenuItem value="">All Pharmacies</MenuItem>
          {pharmacies.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading inventory...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && medicines.length === 0 && (
        <Typography color="gray">
          No medicines found.
        </Typography>
      )}

      {/* INVENTORY LIST */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr 1fr",
          },
          gap: 2,
        }}
      >
        {medicines.map((med) => (
          <Card key={med._id} sx={{ borderRadius: 3 }}>

            <CardContent>

              {/* INFO */}
              <Typography sx={{ fontWeight: "bold" }}>
                {med.name}
              </Typography>

              <Typography variant="body2">
                ₱{med.price}
              </Typography>

              <Typography variant="body2">
                Pharmacy: {med.pharmacy?.name}
              </Typography>

              {/* STOCK STATUS */}
              <Typography
                sx={{
                  color:
                    med.stock <= 5
                      ? "red"
                      : med.stock <= 20
                      ? "orange"
                      : "green",
                  fontWeight: "bold",
                }}
              >
                Stock: {med.stock}
              </Typography>

              {/* UPDATE STOCK */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => updateStock(med._id, med.stock + 10)}
                >
                  +10
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() =>
                    updateStock(med._id, Math.max(0, med.stock - 10))
                  }
                >
                  -10
                </Button>
              </Box>

            </CardContent>

          </Card>
        ))}
      </Box>

    </Box>
  );
}