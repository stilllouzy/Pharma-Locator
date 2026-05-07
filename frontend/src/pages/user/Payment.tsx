import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface IOrder {
  _id: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string;
  items: {
    _id: string;
    medicine: { name: string };
    quantity: number;
    price: number;
  }[];
}

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const token = localStorage.getItem("token");

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/track/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
      if (res.data.paymentStatus === "paid") setPaid(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePayment = async () => {
    if (!referenceNumber || referenceNumber.length < 6) {
      alert("Please enter a valid GCash reference number (at least 6 characters).");
      return;
    }

    setLoading(true);
    try {
      await api.post(
        `/orders/pay/${id}`,
        { referenceNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPaid(true);
      alert("Payment confirmed! Your order is now being prepared.");
      navigate("/user/orders");
    } catch (error) {
      console.error(error);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <Typography sx={{ p: 3 }}>Loading...</Typography>;

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>

      {/* HEADER */}
      <Typography sx={{ fontSize: 24, fontWeight: "bold", mb: 2 }}>
        GCash Payment
      </Typography>

      {/* GCASH UI */}
      <Card
        sx={{
          borderRadius: 3,
          mb: 2,
          background: "linear-gradient(135deg, #0070E0, #00A3E0)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography sx={{ fontSize: 20, fontWeight: "bold" }}>
            GCash
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Send payment to:
          </Typography>
          <Typography sx={{ fontWeight: "bold", fontSize: 18 }}>
            09XX-XXX-XXXX
          </Typography>
          <Typography variant="caption">
            Pharma Locator — Barangay Emmanuel 1
          </Typography>

          <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.3)" }} />

          <Typography variant="body2">Amount to Pay:</Typography>
          <Typography sx={{ fontSize: 28, fontWeight: "bold" }}>
            ₱{order.totalPrice}
          </Typography>
        </CardContent>
      </Card>

      {/* ORDER SUMMARY */}
      <Card sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Order Summary
          </Typography>

          {order.items.map((item) => (
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

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
            <Typography sx={{ fontWeight: "bold" }}>₱{order.totalPrice}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* PAYMENT FORM */}
      {paid ? (
        <Card sx={{ borderRadius: 3, backgroundColor: "#e8f5e9" }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", color: "green", textAlign: "center" }}>
              ✅ Payment Confirmed!
            </Typography>
            <Typography variant="body2" color="gray" sx={{ textAlign: "center" }}>
              Your order is now being prepared.
            </Typography>
            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate("/user/orders")}
            >
              View My Orders
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography sx={{ fontWeight: "bold", mb: 1 }}>
              Enter GCash Reference Number
            </Typography>
            <Typography variant="caption" color="gray" sx={{ display: "block", mb: 2 }}>
              After sending payment via GCash, enter the reference number below to confirm your payment.
            </Typography>

            <TextField
              fullWidth
              label="GCash Reference Number"
              placeholder="e.g. 1234567890"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? "Confirming..." : "Confirm Payment"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => navigate("/user/orders")}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}