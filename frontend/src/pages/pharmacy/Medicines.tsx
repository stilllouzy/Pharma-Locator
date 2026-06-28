import { useEffect, useState } from "react";
import api from "../../api/api";

import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Card,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    genericName: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const token = localStorage.getItem("token");

  // FETCH MEDICINES
  const fetchMedicines = async () => {
    const res = await api.get("/medicines/my", {
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

  // DELETE MEDICINE
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    await api.delete(`/medicines/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMedicines();
  };

  // EDIT MEDICINE
  const handleEdit = (row: any) => {
    setSelectedMedicine(row);
    setForm({
      name: row.name,
      genericName: row.genericName ?? "",
      description: row.description,
      price: row.price,
      stock: row.stock,
      category: row.category,
    });
    setEditOpen(true);
  };

  // UPDATE MEDICINE
  const handleUpdate = async () => {
    await api.put(`/medicines/${selectedMedicine._id}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setEditOpen(false);
    fetchMedicines();
  };

  // TABLE COLUMNS
  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "genericName", headerName: "Generic Name", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "stock", headerName: "Stock", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            size="small"
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
            onClick={() => handleEdit(params.row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
            onClick={() => handleDelete(params.row._id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <MedicationOutlinedIcon sx={{ color: "primary.main", fontSize: 22 }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: "primary.main" }}>
            Medicines
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">
          Brgy. Emmanuel Bergado 1 · Manage your pharmacy inventory
        </Typography>
      </Box>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        disableElevation
        sx={{ mb: 2.5, borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
      >
        Add Medicine
      </Button>

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ height: 500 }}>
          <DataGrid
            rows={medicines}
            columns={columns}
            getRowId={(row) => row._id}
            sx={{
              border: 0,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#F8FAFC",
                fontWeight: 700,
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid rgba(0,0,0,0.05)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#F9FBFD",
              },
            }}
          />
        </Box>
      </Card>

      {/* ADD MODAL */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            width: 450,
            bgcolor: "background.paper",
            p: 4,
            mx: "auto",
            mt: "8%",
            borderRadius: 3,
            boxShadow: 24,
          }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "primary.main", mb: 2 }}>
            Add Medicine
          </Typography>

          <TextField
            fullWidth
            label="Name"
            margin="normal"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Generic Name"
            margin="normal"
            onChange={(e) => setForm({ ...form, genericName: e.target.value })}
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

      {/* EDIT MODAL */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
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
          <Typography variant="h6">Edit Medicine</Typography>

          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Generic Name"
            margin="normal"
            value={form.genericName}
            onChange={(e) => setForm({ ...form, genericName: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            margin="normal"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <TextField
            fullWidth
            label="Stock"
            type="number"
            margin="normal"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <TextField
            fullWidth
            label="Category"
            margin="normal"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleUpdate}>
            Update
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}