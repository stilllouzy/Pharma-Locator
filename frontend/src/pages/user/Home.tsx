import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  IconButton,
  Button,
  Modal,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useState } from "react";
import api from "../../api/api";
import { useSearchParams } from "react-router-dom";
import MapView from "../user/MapView";


export default function Home() {
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [params] = useSearchParams();
  const pharmacyId = params.get("pharmacy");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [medicines, setMedicines] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
const [deliveryMethod, setDeliveryMethod] = useState("delivery");
const [deliveryAddress, setDeliveryAddress] = useState("");

  const token = localStorage.getItem("token");
  

  // 🔥 DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // 🔥 FETCH MEDICINES (ONLY IF PHARMACY SELECTED)
  const fetchMedicines = async () => {
    const activePharmacy = selectedPharmacy || pharmacyId;

    if (!activePharmacy) {
      setMedicines([]);
      return;
    }

    try {
      setMedicines([]); // clear old data

      const res = await api.get("/medicines", {
        params: {
          search: debouncedSearch,
          pharmacyId: activePharmacy,
        },
      });

      setMedicines(res.data || []);
    } catch (error) {
      console.error(error);
      setMedicines([]);
    }
  };

  useEffect(() => {
    const activePharmacy = selectedPharmacy || pharmacyId;

    if (!activePharmacy) {
      setMedicines([]);
      return;
    }

    fetchMedicines();
  }, [debouncedSearch, selectedPharmacy, pharmacyId]);

  // 🛒 ADD TO CART
  const addToCart = (medicine: any) => {
    const existing = cart.find((item) => item._id === medicine._id);

    if (existing) {
      setCart(
        cart.map((item) =>
          item._id === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };

  // 💳 CHECKOUT
 const checkout = async () => {
  if (cart.length === 0) return;

  if (
    deliveryMethod === "delivery" &&
    !deliveryAddress
  ) {
    alert("Please enter a delivery address.");
    return;
  }

  try {
    const res = await api.post(
      "/orders",
      {
        items: cart.map((item) => ({
          medicine: item._id,
          quantity: item.quantity,
        })),

        deliveryMethod,

        deliveryAddress:
          deliveryMethod === "delivery"
            ? deliveryAddress
            : "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setCheckoutOpen(false);
    setCart([]);

    // ALWAYS REDIRECT TO GCASH PAYMENT
    window.location.href = `/user/payment/${res.data._id}`;

  } catch (error) {
    console.error(error);
    alert("Failed to place order.");
  }
};

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", p: 2 }}>
      
      {/* HEADER */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <LocationOnIcon color="primary" />
          <Box sx={{ ml: 1 }}>
            <Typography sx={{ fontWeight: "bold" }}>Home</Typography>
            <Typography variant="caption">Dasmariñas, Cavite</Typography>
          </Box>
          <FavoriteBorderIcon />
        </Box>

        {/* SEARCH */}
        <Box sx={{ mt: 2, display: "flex" }}>
          <TextField
            fullWidth
            placeholder="Search for medicine (e.g., Paracetamol)"
            onChange={(e) => setSearch(e.target.value)}
            sx={{ backgroundColor: "white", borderRadius: 5 }}
          />
          <IconButton>
            <TuneIcon />
          </IconButton>
        </Box>
      </Box>

      {/* MAIN GRID */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 2,
        }}
      >

        {/* MAP */}
        <Box sx={{ px: 2 }}>
          <Card sx={{ borderRadius: 3, height: "60vh" }}>
            <MapView onSelectPharmacy={setSelectedPharmacy} />

            <CardContent>
              <Typography sx={{ fontWeight: "bold" }}>
                Verified Pharmacies
              </Typography>
              <Typography variant="caption">
                Click a pharmacy to view medicines
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* MEDICINES */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Card sx={{ p: 2, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: "bold" }}>Medicines</Typography>
            </Card>

            {/* 🔥 STATES */}
            {!(selectedPharmacy || pharmacyId) ? (
              <Typography variant="caption" color="gray">
                Select a pharmacy from the map to view medicines
              </Typography>
            ) : medicines.length === 0 ? (
              <Typography variant="caption" color="gray">
                No medicines available for this pharmacy
              </Typography>
            ) : (
              medicines.map((med) => (
                <Card
                  key={med._id}
                  sx={{ minWidth: 150, borderRadius: 3, p: 1 }}
                >
                  <Box
                    sx={{
                      height: 80,
                      backgroundColor: "#e0e0e0",
                      borderRadius: 2,
                    }}
                  />

                  <Typography sx={{ mt: 1, fontSize: 12 }}>
                    {med.name}
                  </Typography>

                  <Typography sx={{ fontSize: 11, color: "gray" }}>
                    ₱{med.price}
                  </Typography>

                  <Typography sx={{ fontSize: 10, color: "gray" }}>
                    {med.pharmacy?.name}
                  </Typography>

                  <Typography sx={{ fontSize: 10, color: "gray" }}>
                    Stock: {med.stock}
                  </Typography>

                  <Button
                    size="small"
                    variant="contained"
                    sx={{ mt: 1 }}
                    onClick={() => addToCart(med)}
                  >
                    Add
                  </Button>
                </Card>
              ))
            )}
          </Box>
        </Box>
      </Box>

{/* CART */}
<Box sx={{ p: 2 }}>
  <Card sx={{ p: 2, borderRadius: 3 }}>
    <Typography sx={{ fontWeight: "bold" }}>
      Cart
    </Typography>

    {cart.length === 0 ? (
      <Typography variant="caption">
        No items yet
      </Typography>
    ) : (
      <>
        {cart.map((item) => (
          <Box
            key={item._id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography>
              {item.name}
            </Typography>

            <Typography>
              x{item.quantity} — ₱
              {item.price * item.quantity}
            </Typography>
          </Box>
        ))}

        <Typography
          sx={{ fontWeight: "bold", mt: 1 }}
        >
          Total: ₱
          {cart.reduce(
            (sum, item) =>
              sum + item.price * item.quantity,
            0
          )}
        </Typography>
      </>
    )}

    <Button
      fullWidth
      variant="contained"
      sx={{ mt: 2 }}
      disabled={cart.length === 0}
      onClick={() => setCheckoutOpen(true)}
    >
      Checkout
    </Button>
  </Card>
</Box>

{/* CHECKOUT MODAL */}
<Modal
  open={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
>
  <Box
    sx={{
      width: 400,
      bgcolor: "white",
      p: 3,
      mx: "auto",
      mt: "10%",
      borderRadius: 3,
    }}
  >
    <Typography variant="h6" sx={{ mb: 2 }}>
      Checkout
    </Typography>

    {/* DELIVERY METHOD */}
    <FormControl sx={{ mb: 2 }}>
      <FormLabel>
        Delivery Method
      </FormLabel>

      <RadioGroup
        value={deliveryMethod}
        onChange={(e) =>
          setDeliveryMethod(e.target.value)
        }
      >
        <FormControlLabel
          value="delivery"
          control={<Radio />}
          label="Delivery"
        />

        <FormControlLabel
          value="pickup"
          control={<Radio />}
          label="Pickup"
        />
      </RadioGroup>
    </FormControl>

    {/* DELIVERY ADDRESS */}
    {deliveryMethod === "delivery" && (
      <TextField
        fullWidth
        label="Delivery Address"
        value={deliveryAddress}
        onChange={(e) =>
          setDeliveryAddress(e.target.value)
        }
        sx={{ mb: 2 }}
      />
    )}

    

    {/* ORDER SUMMARY */}
    <Typography
      sx={{ fontWeight: "bold", mb: 1 }}
    >
      Order Summary
    </Typography>

    {cart.map((item) => (
      <Box
        key={item._id}
        sx={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2">
          {item.name} x{item.quantity}
        </Typography>

        <Typography variant="body2">
          ₱{item.price * item.quantity}
        </Typography>
      </Box>
    ))}

    <Typography
      sx={{ fontWeight: "bold", mt: 1 }}
    >
      Total: ₱
      {cart.reduce(
        (sum, item) =>
          sum + item.price * item.quantity,
        0
      )}
    </Typography>

    <Button
      fullWidth
      variant="contained"
      sx={{ mt: 2 }}
      onClick={checkout}
    >
      Proceed to GCash Payment
    </Button>
  </Box>
</Modal>
      {/* BOTTOM NAV */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "space-around",
          p: 1,
          boxShadow: 3,
        }}
      >
        <Typography>🏠</Typography>
        <Typography>🔔</Typography>
        <Typography>👤</Typography>
      </Box>
    </Box>
  );
}