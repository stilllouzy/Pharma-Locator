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

interface IPharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  ownerId?: string;
}

export default function PharmaManagement() {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔷 FETCH PHARMACIES
  const fetchPharmacies = async () => {
    setLoading(true);

    try {
      const res = await api.get("/admin/pharmacies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { search },
      });

      setPharmacies(res.data);
    } catch (error) {
      console.log("Error fetching pharmacies:", error);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, [search]);

  // 🔷 TOGGLE ACTIVE STATUS
  const toggleStatus = async (id: string) => {
    try {
      await api.put(
        `/admin/pharmacies/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  // 🔷 DELETE PHARMACY
  const deletePharmacy = async (id: string) => {
    try {
      await api.delete(`/admin/pharmacies/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchPharmacies();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          Pharmacy Management
        </Typography>
        <Typography variant="caption" color="gray">
          Manage all registered pharmacies
        </Typography>
      </Box>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search pharmacy..."
        onChange={(e) => setSearch(e.target.value)}
        sx={{ backgroundColor: "white", borderRadius: 2, mb: 2 }}
      />

      {/* LOADING */}
      {loading && (
        <Typography color="gray" sx={{ mb: 2 }}>
          Loading pharmacies...
        </Typography>
      )}

      {/* EMPTY STATE */}
      {!loading && pharmacies.length === 0 && (
        <Typography color="gray">
          No pharmacies found.
        </Typography>
      )}

      {/* LIST */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        {pharmacies.map((pharmacy) => (
          <Card key={pharmacy._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              {/* INFO */}
              <Typography sx={{ fontWeight: "bold" }}>
                {pharmacy.name}
              </Typography>

              <Typography variant="body2">
                {pharmacy.address}
              </Typography>

              <Typography variant="body2">
                {pharmacy.phone}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  color: pharmacy.isActive ? "green" : "red",
                }}
              >
                {pharmacy.isActive ? "ACTIVE" : "INACTIVE"}
              </Typography>

              {/* ACTIONS */}
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color={pharmacy.isActive ? "warning" : "success"}
                  onClick={() => toggleStatus(pharmacy._id)}
                >
                  {pharmacy.isActive ? "Deactivate" : "Activate"}
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => deletePharmacy(pharmacy._id)}
                >
                  Delete
                </Button>
              </Box>

            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}