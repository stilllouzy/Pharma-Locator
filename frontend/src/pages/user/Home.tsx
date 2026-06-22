import {
  Box,
  Typography,
  TextField,
  Card,
  CardContent,
  Button,
  Modal,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Chip,
  IconButton,
  InputAdornment,
  Collapse,
  Skeleton,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import MapView from "../user/MapView";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IMedicine {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  pharmacyId?: { _id?: string; name: string };
  pharmacy?: { _id?: string; name: string };
}

interface ICartItem extends IMedicine {
  quantity: number;
}

// ─── Cart persistence (per logged-in user) ───────────────────────────────────
function getCartKey(): string | null {
  const userId = localStorage.getItem("userId");
  return userId ? `cart:${userId}` : null;
}

function loadCart(): ICartItem[] {
  const key = getCartKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart: ICartItem[]) {
  const key = getCartKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(cart));
  } catch {
    // Storage full or unavailable — cart still works in-memory for this session.
  }
}

export default function Home() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pharmacyIdFromMap = params.get("pharmacy");

  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [selectedPharmacyName, setSelectedPharmacyName] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [hasSearchedOrFiltered, setHasSearchedOrFiltered] = useState(false);

  const [cart, setCart] = useState<ICartItem[]>(() => loadCart());
  const [cartExpanded, setCartExpanded] = useState(false);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const token = localStorage.getItem("token");
  const activePharmacyId = selectedPharmacy || pharmacyIdFromMap;

  // Persist cart on every change.
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Debounce search input.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch medicines whenever search or pharmacy filter changes.
  useEffect(() => {
    const fetchMedicines = async () => {
      const trimmed = debouncedSearch.trim();
      if (!trimmed && !activePharmacyId) {
        setMedicines([]);
        setHasSearchedOrFiltered(false);
        return;
      }

      setHasSearchedOrFiltered(true);
      setLoadingMedicines(true);
      try {
        const queryParams: Record<string, string> = {};
        if (trimmed) queryParams.search = trimmed;
        else if (activePharmacyId) queryParams.pharmacyId = activePharmacyId;

        const res = await api.get("/medicines", { params: queryParams });
        setMedicines(res.data || []);
      } catch (error) {
        console.error(error);
        setMedicines([]);
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, [debouncedSearch, activePharmacyId]);

  const handleSelectPharmacy = (id: string, name?: string) => {
    setSelectedPharmacy(id);
    setSelectedPharmacyName(name ?? null);
  };

  const clearPharmacyFilter = () => {
    setSelectedPharmacy(null);
    setSelectedPharmacyName(null);
  };

  // ─── Cart actions ───────────────────────────────────────────────────────────
  const addToCart = (medicine: IMedicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === medicine._id);
      if (existing) {
        return prev.map((item) =>
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...medicine, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // ─── Checkout ───────────────────────────────────────────────────────────────
  const checkout = async () => {
    if (cart.length === 0) return;
    setCheckoutError("");

    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      setCheckoutError("Enter a delivery address to continue.");
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await api.post(
        "/orders",
        {
          items: cart.map((item) => ({ medicine: item._id, quantity: item.quantity })),
          deliveryMethod,
          deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress.trim() : "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCheckoutOpen(false);
      setCart([]);
      navigate(`/user/payment/${res.data._id}`);
    } catch (error) {
      console.error(error);
      setCheckoutError("Couldn't place your order. Try again in a moment.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <Box sx={{ pb: cart.length > 0 ? "88px" : 0 }}>
      {/* SEARCH */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary", mb: 0.25 }}>
          Find medicine near you
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Search by name, or pick a pharmacy on the map to browse what they stock.
        </Typography>

        <TextField
          fullWidth
          placeholder="Search for medicine (e.g., Paracetamol)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            backgroundColor: "#fff",
            borderRadius: "10px",
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* MAP */}
      <Card sx={{ borderRadius: "12px", mb: 2.5, overflow: "hidden" }}>
        <Box sx={{ height: { xs: "38vh", md: "46vh" } }}>
          <MapView
            onSelectPharmacy={(id) => handleSelectPharmacy(id)}
          />
        </Box>
        <CardContent sx={{ py: "12px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocalPharmacyOutlinedIcon sx={{ fontSize: 17, color: "#0D3B6E" }} />
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "text.primary" }}>
                Verified pharmacies
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Tap a pin to browse its medicines
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* CONTEXT CHIP — shown once a pharmacy filter is active */}
      {selectedPharmacy && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`Browsing: ${selectedPharmacyName ?? "Selected pharmacy"}`}
            onDelete={clearPharmacyFilter}
            sx={{
              backgroundColor: "#EEF4FB",
              color: "#0D3B6E",
              fontWeight: 600,
              fontSize: "0.78rem",
            }}
          />
        </Box>
      )}

      {/* MEDICINE RESULTS */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary", mb: 1.5 }}>
          Medicines
        </Typography>

        {!hasSearchedOrFiltered && (
          <Box
            sx={{
              py: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#fff",
              borderRadius: "12px",
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", px: 3 }}>
              Search for a medicine or select a pharmacy on the map to see what's in stock.
            </Typography>
          </Box>
        )}

        {hasSearchedOrFiltered && loadingMedicines && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={150} />
            ))}
          </Box>
        )}

        {hasSearchedOrFiltered && !loadingMedicines && medicines.length === 0 && (
          <Box
            sx={{
              py: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              backgroundColor: "#fff",
              borderRadius: "12px",
            }}
          >
            <MedicalServicesOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              No medicines found.
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Try a different name, or clear the pharmacy filter.
            </Typography>
          </Box>
        )}

        {hasSearchedOrFiltered && !loadingMedicines && medicines.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
              gap: 1.5,
            }}
          >
            {medicines.map((med) => {
              const pharmacyName = med.pharmacy?.name ?? med.pharmacyId?.name ?? "Unknown pharmacy";
              const outOfStock = med.stock === 0;
              return (
                <Card key={med._id} sx={{ borderRadius: "12px", display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{
                      height: 72,
                      backgroundColor: "#EEF4FB",
                      borderRadius: "10px 10px 0 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#0D3B6E",
                    }}
                  >
                    <MedicalServicesOutlinedIcon sx={{ fontSize: 26 }} />
                  </Box>
                  <CardContent sx={{ p: "12px !important", flex: 1, display: "flex", flexDirection: "column" }}>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "text.primary",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {med.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#0D3B6E", fontWeight: 600, mt: 0.25 }}>
                      ₱{med.price.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", mt: 0.25 }}
                    >
                      {pharmacyName}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: outOfStock ? "#C62828" : "text.disabled", mt: 0.25 }}
                    >
                      {outOfStock ? "Out of stock" : `${med.stock} in stock`}
                    </Typography>

                    <Button
                      size="small"
                      variant="contained"
                      disabled={outOfStock}
                      onClick={() => addToCart(med)}
                      sx={{
                        mt: 1.25,
                        backgroundColor: "#0D3B6E",
                        "&:hover": { backgroundColor: "#0A2E55" },
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        boxShadow: "none",
                      }}
                    >
                      {outOfStock ? "Unavailable" : "Add to cart"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* STICKY CART BAR */}
      {cart.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: "#fff",
            borderTop: "1px solid rgba(13,59,110,0.12)",
            boxShadow: "0 -4px 20px rgba(13,59,110,0.10)",
          }}
        >
          <Collapse in={cartExpanded}>
            <Box sx={{ maxHeight: "40vh", overflowY: "auto", px: 2, pt: 1.5 }}>
              {cart.map((item) => (
                <Box
                  key={item._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    py: 0.75,
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₱{item.price.toFixed(2)} each
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                    <IconButton size="small" onClick={() => updateQuantity(item._id, -1)}>
                      <RemoveIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                    <Typography sx={{ fontSize: "0.82rem", minWidth: 18, textAlign: "center" }}>
                      {item.quantity}
                    </Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item._id, 1)}>
                      <AddIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>

                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, minWidth: 60, textAlign: "right" }}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ mt: 1 }} />
            </Box>
          </Collapse>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
              px: 2,
              py: 1.25,
            }}
          >
            <Box
              onClick={() => setCartExpanded((prev) => !prev)}
              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", flex: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "9px",
                  backgroundColor: "#5BC4A0",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShoppingBagOutlinedIcon sx={{ fontSize: 17 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "text.primary" }}>
                  {cartCount} item{cartCount !== 1 ? "s" : ""} · ₱{cartTotal.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cartExpanded ? "Tap to collapse" : "Tap to view cart"}
                </Typography>
              </Box>
              {cartExpanded ? (
                <ExpandMoreIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              ) : (
                <ExpandLessIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => setCheckoutOpen(true)}
              sx={{
                backgroundColor: "#0D3B6E",
                "&:hover": { backgroundColor: "#0A2E55" },
                borderRadius: "8px",
                fontSize: "0.8rem",
                px: 2.5,
                boxShadow: "none",
                flexShrink: 0,
              }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      )}

      {/* CHECKOUT MODAL */}
      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)}>
        <Box
          sx={{
            width: { xs: "90%", sm: 420 },
            maxHeight: "85vh",
            overflowY: "auto",
            bgcolor: "white",
            p: { xs: 2.5, sm: 3 },
            mx: "auto",
            mt: "8%",
            borderRadius: "16px",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary" }}>
              Checkout
            </Typography>
            <IconButton size="small" onClick={() => setCheckoutOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <FormControl sx={{ mb: 2, width: "100%" }}>
            <FormLabel sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary", mb: 0.5 }}>
              Delivery method
            </FormLabel>
            <RadioGroup value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value)}>
              <FormControlLabel value="delivery" control={<Radio size="small" />} label="Delivery" />
              <FormControlLabel value="pickup" control={<Radio size="small" />} label="Pickup" />
            </RadioGroup>
          </FormControl>

          {deliveryMethod === "delivery" && (
            <TextField
              fullWidth
              label="Delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 1, color: "text.primary" }}>
            Order summary
          </Typography>

          {cart.map((item) => (
            <Box key={item._id} sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {item.name} x{item.quantity}
              </Typography>
              <Typography variant="body2">₱{(item.price * item.quantity).toFixed(2)}</Typography>
            </Box>
          ))}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: checkoutError ? 1.5 : 0 }}>
            <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography sx={{ fontWeight: 600 }}>₱{cartTotal.toFixed(2)}</Typography>
          </Box>

          {checkoutError && (
            <Typography variant="caption" sx={{ color: "#C62828", display: "block", mb: 1.5 }}>
              {checkoutError}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            onClick={checkout}
            disabled={placingOrder}
            sx={{
              mt: 1,
              backgroundColor: "#0D3B6E",
              "&:hover": { backgroundColor: "#0A2E55" },
              borderRadius: "10px",
              boxShadow: "none",
            }}
          >
            {placingOrder ? "Placing order..." : "Proceed to GCash payment"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}