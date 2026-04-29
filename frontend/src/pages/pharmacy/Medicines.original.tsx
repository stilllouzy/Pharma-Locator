import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";


export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const token = localStorage.getItem("token");

  // FETCH MEDICINES
  const fetchMedicines = async () => {
    const res = await api.get("/medicines/pharmacy", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMedicines(res.data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // ADD MEDICINE
  const handleAdd = async () => {
    await api.post("/medicines", form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setOpen(false);
    fetchMedicines();
  };

  // TABLE COLUMNS
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "stock", headerName: "Stock", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
  ];

  return (
    <Box sx={{p:3}}>
      <Typography variant="h5">Medicines</Typography>

      <Button variant="contained" sx={{ my: 2 }} onClick={() => setOpen(true)}>
        Add Medicine
      </Button>

      <div style={{ height: 400 }}>
        <DataGrid
          rows={medicines}
          columns={columns}
          getRowId={(row) => row._id}
        />
      </div>

      {/* MODAL FORM */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 400,
            bgcolor: "white",
            p: 3,
            mx: "auto",
            mt: "10%",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6">Add Medicine</Typography>

          <TextField
            fullWidth
            label="Name"
            margin="normal"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            fullWidth
            label="Description"
            margin="normal"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <TextField
            fullWidth
            label="Stock"
            type="number"
            margin="normal"
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />

          <TextField
            fullWidth
            label="Category"
            margin="normal"
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleAdd}>
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  )}

