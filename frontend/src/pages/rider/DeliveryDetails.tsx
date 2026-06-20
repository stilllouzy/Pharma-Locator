import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface IDelivery {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  pharmacy: {
    name: string;
    address: string;
  };
  items: {
    _id: string;
    medicine: { name: string; price: number };
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  deliveryAddress: string;
  deliveryStatus: string;
  status: string;
  paymentStatus: string;
  deliveryMethod: string;
  createdAt: string;
  proofOfDelivery?: {          // ← ADD THIS to interface
    imageUrl: string | null;
    uploadedAt: string | null;
  };
}

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<IDelivery | null>(null);
  const [loading, setLoading] = useState(false);
 const [podBase64, setPodBase64] = useState<string>("");
const [podPreview, setPodPreview] = useState<string>("");
const [uploading, setUploading] = useState(false);               // ← ADD
  const token = localStorage.getItem("token");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rider/deliveries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDelivery(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // ── ADD THESE TWO HANDLERS ──────────────────────────────────────
 const handlePodImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    setPodBase64(base64);
    setPodPreview(base64);
  };
  reader.readAsDataURL(file);
};

const handleUploadAndDeliver = async () => {
  if (!podBase64) return alert("Please select an image first.");
  setUploading(true);
  try {
    await api.patch(
      `/orders/${id}/proof-of-delivery`,
      { imageUrl: podBase64 },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Proof of delivery uploaded! Order marked as delivered.");
    fetchDetails();
  } catch (error) {
    console.error(error);
    alert("Upload failed. Please try again.");
  } finally {
    setUploading(false);
  }
};
  // ───────────────────────────────────────────────────────────────

  if (loading) return <Typography sx={{ p: 3 }}>Loading...</Typography>;
  if (!delivery) return <Typography sx={{ p: 3 }}>Delivery not found.</Typography>;

  return (
    <Box sx={{ p: 3 }}>

      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/rider/deliveries")}
      >
        ← Back to Deliveries
      </Button>

      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 2, color : "primary.main" }}>
        Delivery Details
      </Typography>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>

          {/* STATUS */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Chip
              label={delivery.deliveryStatus.replace("_", " ").toUpperCase()}
              color="primary"
              size="small"
            />
            <Chip
              label={delivery.status.toUpperCase()}
              color="warning"
              size="small"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* CUSTOMER INFO */}
          <Typography sx={{ fontWeight: "bold" }}>Customer</Typography>
          <Typography variant="body2">{delivery.user?.name}</Typography>
          <Typography variant="body2">{delivery.user?.email}</Typography>

          <Divider sx={{ my: 2 }} />

          {/* PHARMACY INFO */}
          <Typography sx={{ fontWeight: "bold" }}>Pickup From</Typography>
          <Typography variant="body2">{delivery.pharmacy?.name}</Typography>
          <Typography variant="body2">{delivery.pharmacy?.address}</Typography>

          <Divider sx={{ my: 2 }} />

          {/* DELIVERY ADDRESS */}
          <Typography sx={{ fontWeight: "bold" }}>Deliver To</Typography>
          <Typography variant="body2">{delivery.deliveryAddress}</Typography>

          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.deliveryAddress)}`}
            target="_blank"
          >
            Get Directions
          </Button>

          <Divider sx={{ my: 2 }} />

          {/* ITEMS */}
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>Items</Typography>
          {delivery.items.map((item) => (
            <Box
              key={item._id}
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography variant="body2">
                {item.medicine?.name} x{item.quantity}
              </Typography>
              <Typography variant="body2">
                ₱{item.price * item.quantity}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          {/* TOTAL */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
            <Typography sx={{ fontWeight: "bold" }}>₱{delivery.totalPrice}</Typography>
          </Box>

          <Typography variant="caption" color="gray" sx={{ display: "block", mt: 1 }}>
            Payment: {delivery.paymentStatus}
          </Typography>

          <Typography variant="caption" color="gray" sx={{ display: "block" }}>
            Ordered: {new Date(delivery.createdAt).toLocaleDateString()}
          </Typography>

          {/* ── PROOF OF DELIVERY SECTION ─────────────────────────── */}
          {delivery.deliveryStatus === "on_the_way" && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                Proof of Delivery
              </Typography>
              <Typography variant="body2" color="gray" sx={{ mb: 1 }}>
                Take a photo of the delivered package and upload it to complete the delivery.
              </Typography>

              <Button variant="outlined" component="label" size="small" sx={{ mb: 1 }}>
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handlePodImageChange}
                />
              </Button>

              {/* IMAGE PREVIEW */}
              {podPreview && (
                <Box sx={{ my: 1 }}>
                  <img
                    src={podPreview}
                    alt="Preview"
                    style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleUploadAndDeliver}
                disabled={!podBase64 || uploading}
                sx={{ mt: 1 }}
              >
                {uploading ? <CircularProgress size={20} color="inherit" /> : "Upload & Mark as Delivered"}
              </Button>
            </>
          )}

          {/* ALREADY DELIVERED — show the uploaded proof */}
          {delivery.deliveryStatus === "delivered" && delivery.proofOfDelivery?.imageUrl && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>Proof of Delivery</Typography>
              <img
                src={delivery.proofOfDelivery.imageUrl}
                alt="Proof of Delivery"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8 }}
              />
              {delivery.proofOfDelivery.uploadedAt && (
                <Typography variant="caption" color="gray" sx={{ display: "block", mt: 0.5 }}>
                  Uploaded: {new Date(delivery.proofOfDelivery.uploadedAt).toLocaleString()}
                </Typography>
              )}
            </>
          )}
          {/* ─────────────────────────────────────────────────────── */}

        </CardContent>
      </Card>
    </Box>
  );
}