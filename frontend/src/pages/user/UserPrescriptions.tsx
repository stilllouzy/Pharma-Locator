import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../api/api";

interface IPharmacy {
  _id: string;
  name: string;
}

interface IPrescription {
  _id: string;
  pharmacy: { name: string };
  status: "pending" | "approved" | "rejected";
  imageUrl: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function Prescription() {
  const [pharmacies, setPharmacies] = useState<IPharmacy[]>([]);
  const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // FETCH PHARMACIES
  const fetchPharmacies = async () => {
    try {
      const res = await api.get("/pharmacies");
      setPharmacies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // FETCH MY PRESCRIPTIONS
  const fetchMyPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrescriptions(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPharmacies();
    fetchMyPrescriptions();
  }, []);

  // HANDLE IMAGE SELECTION
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageBase64(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // UPLOAD PRESCRIPTION
  const handleUpload = async () => {
    if (!selectedPharmacy || !imageBase64) {
      alert("Please select a pharmacy and upload an image.");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "/prescriptions",
        {
          pharmacy: selectedPharmacy,
          imageUrl: imageBase64,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Prescription uploaded successfully!");
      setImageBase64("");
      setPreview("");
      setSelectedPharmacy("");
      fetchMyPrescriptions();
    } catch (error) {
      console.error(error);
      alert("Failed to upload prescription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* HEADER */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 24, fontWeight: "bold" }}>
          My Prescriptions
        </Typography>
        <Typography variant="caption" color="gray">
          Upload and track your prescription status
        </Typography>
      </Box>

      {/* UPLOAD FORM */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 2 }}>
            Upload Prescription
          </Typography>

          {/* PHARMACY SELECT */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Pharmacy</InputLabel>
            <Select
              value={selectedPharmacy}
              label="Select Pharmacy"
              onChange={(e) => setSelectedPharmacy(e.target.value)}
            >
              {pharmacies.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* IMAGE UPLOAD */}
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Choose Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>

          {/* PREVIEW */}
          {preview && (
            <Box sx={{ mb: 2 }}>
              <img
                src={preview}
                alt="Prescription Preview"
                style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8 }}
              />
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload Prescription"}
          </Button>
        </CardContent>
      </Card>

      {/* MY PRESCRIPTIONS LIST */}
      <Typography sx={{ fontWeight: "bold", mb: 2 }}>
        My Uploaded Prescriptions
      </Typography>

      {prescriptions.length === 0 && (
        <Typography color="gray">No prescriptions uploaded yet.</Typography>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {prescriptions.map((p) => (
          <Card key={p._id} sx={{ borderRadius: 3 }}>
            <CardContent>

              <Typography sx={{ fontWeight: "bold" }}>
                {p.pharmacy?.name}
              </Typography>

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
                }}
              >
                Status: {p.status.toUpperCase()}
              </Typography>

              {p.rejectionReason && (
                <Typography variant="caption" color="red">
                  Reason: {p.rejectionReason}
                </Typography>
              )}

              <Box sx={{ mt: 1 }}>
                <img
                  src={p.imageUrl}
                  alt="Prescription"
                  style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8 }}
                />
              </Box>

              <Typography variant="caption" color="gray">
                Uploaded: {new Date(p.createdAt).toLocaleDateString()}
              </Typography>

            </CardContent>
          </Card>
        ))}
      </Box>

    </Box>
  );
}