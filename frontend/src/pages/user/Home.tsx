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
  Snackbar,
  Alert,
} from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "../../api/api";
import MapView from "../user/MapView";
import {
  isMedicineFavorited,
  isPharmacyFavorited,
  toggleFavoriteMedicine,
  toggleFavoritePharmacy,
  notifyFavoritesChanged,
} from "../../utils/favorites";

// ─── Types ────────────────────────────────────────────────────────────────────
interface IMedicine {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  description?: string;
  genericName?: string;
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

// ─── Shared th style ──────────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 16px",
  fontWeight: 600,
  color: "#6B7280",
  fontSize: "0.72rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
  whiteSpace: "nowrap",
};

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const pharmacyIdFromMap = params.get("pharmacy");
  const addMedicineId = params.get("addMedicine");
  const nearestRequested = params.get("nearest") === "true";

  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [selectedPharmacyName, setSelectedPharmacyName] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [hasSearchedOrFiltered, setHasSearchedOrFiltered] = useState(false);

  const [cart, setCart] = useState<ICartItem[]>(() => loadCart());
  const [cartExpanded, setCartExpanded] = useState(false);
  const [, setFavoritesVersion] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });

  const token = localStorage.getItem("token");
  const activePharmacyId = selectedPharmacy || pharmacyIdFromMap;

  // Persist cart on every change.
  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  // Fetch medicines whenever the selected pharmacy filter changes.
  useEffect(() => {
    const fetchMedicines = async () => {
      if (!activePharmacyId) {
        setMedicines([]);
        setHasSearchedOrFiltered(false);
        return;
      }

      setHasSearchedOrFiltered(true);
      setLoadingMedicines(true);
      try {
        const res = await api.get("/medicines", { params: { pharmacyId: activePharmacyId } });
        setMedicines(res.data || []);
      } catch (error) {
        console.error(error);
        setMedicines([]);
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, [activePharmacyId]);

  const handleSelectPharmacy = (id: string, name?: string) => {
    setSelectedPharmacy(id);
    setSelectedPharmacyName(name ?? null);
  };

  const handleSearchSubmit = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    navigate(`/user/results?q=${encodeURIComponent(trimmed)}`);
  };

  const clearPharmacyFilter = () => {
    setSelectedPharmacy(null);
    setSelectedPharmacyName(null);
  };

  useEffect(() => {
    if (!addMedicineId) return;

    const addFromResult = async () => {
      const state = location.state as { medicineToAdd?: IMedicine } | null;
      let medicine = state?.medicineToAdd && state.medicineToAdd._id === addMedicineId
        ? state.medicineToAdd
        : null;

      if (!medicine) {
        try {
          const res = await api.get(`/medicines/${addMedicineId}`);
          medicine = res.data;
        } catch (error) {
          console.error(error);
          setSnackbar({ open: true, message: "Couldn't find that medicine. Try again from the list." });
        }
      }

      if (medicine) {
        setCart((prev) => {
          const existing = prev.find((item) => item._id === medicine!._id);
          if (existing) {
            return prev.map((item) =>
              item._id === medicine!._id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prev, { ...medicine!, quantity: 1 }];
        });
        setSnackbar({ open: true, message: `${medicine.name} added to your cart.` });
      }

      const next = new URLSearchParams(params);
      next.delete("addMedicine");
      navigate(`/user?${next.toString()}`, { replace: true, state: {} });
    };

    addFromResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMedicineId]);

  const handleToggleFavoriteMedicine = (medicine: IMedicine, pharmacyName: string) => {
    toggleFavoriteMedicine({
      _id: medicine._id,
      name: medicine.name,
      price: medicine.price,
      category: medicine.category,
      pharmacyName,
    });
    notifyFavoritesChanged();
    setFavoritesVersion((v) => v + 1);
  };

  const handleToggleFavoritePharmacy = () => {
    if (!selectedPharmacy) return;
    toggleFavoritePharmacy({
      _id: selectedPharmacy,
      name: selectedPharmacyName ?? "Selected pharmacy",
      address: "",
    });
    notifyFavoritesChanged();
    setFavoritesVersion((v) => v + 1);
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

      {/* ── SEARCH HEADER ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 0.25 }}>
          <LocationOnOutlinedIcon sx={{ color: "primary.main", fontSize: 24 }} />
          <Typography variant="h2" sx={{ fontSize: "1.4rem" }}>
            Medicine Search
          </Typography>
        </Box>
        <Typography variant="subtitle1" sx={{ fontSize: "0.83rem", textAlign: "center", mb: 2 }}>
          Brgy. Emmanuel Bergado 1 · Find medicines and nearby pharmacies
        </Typography>

        <TextField
          fullWidth
          placeholder="Search medicine, pharmacy, or 'near me'"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); }}
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
              endAdornment: search.trim() && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleSearchSubmit}
                    sx={{
                      backgroundColor: "#0D3B6E",
                      color: "#fff",
                      width: 30,
                      height: 30,
                      "&:hover": { backgroundColor: "#0A2E55" },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* ── MAP ── */}
      <Card sx={{ borderRadius: "12px", mb: 2.5, overflow: "hidden" }}>
        <Box sx={{ height: { xs: "32vh", sm: "38vh", md: "46vh" } }}>
          <MapView
            onSelectPharmacy={(id, name) => handleSelectPharmacy(id, name)}
            focusPharmacyId={pharmacyIdFromMap}
            findNearest={nearestRequested}
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

      {/* ── PHARMACY FILTER CHIP ── */}
      {selectedPharmacy && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`Browsing: ${selectedPharmacyName ?? "Selected pharmacy"}`}
            onDelete={clearPharmacyFilter}
            sx={{ backgroundColor: "#EEF4FB", color: "#0D3B6E", fontWeight: 600, fontSize: "0.78rem" }}
          />
          <IconButton size="small" onClick={handleToggleFavoritePharmacy}>
            {isPharmacyFavorited(selectedPharmacy)
              ? <FavoriteIcon sx={{ fontSize: 18, color: "#E0457B" }} />
              : <FavoriteBorderIcon sx={{ fontSize: 18, color: "text.disabled" }} />}
          </IconButton>
        </Box>
      )}

      {/* ── MEDICINE RESULTS ── */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "text.primary", mb: 1.5 }}>
          Medicines
        </Typography>

        {/* Empty prompt */}
        {!hasSearchedOrFiltered && (
          <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, backgroundColor: "#fff", borderRadius: "12px" }}>
            <MedicalServicesOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", px: 3 }}>
              Search for a medicine or select a pharmacy on the map to see what's in stock.
            </Typography>
          </Box>
        )}

        {/* Skeleton */}
        {hasSearchedOrFiltered && loadingMedicines && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={44} />
            ))}
          </Box>
        )}

        {/* No results */}
        {hasSearchedOrFiltered && !loadingMedicines && medicines.length === 0 && (
          <Box sx={{ py: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, backgroundColor: "#fff", borderRadius: "12px" }}>
            <MedicalServicesOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">No medicines found.</Typography>
            <Typography variant="caption" color="text.disabled">Try a different name, or clear the pharmacy filter.</Typography>
          </Box>
        )}

        {/* ── Medicine table ── */}
        {hasSearchedOrFiltered && !loadingMedicines && medicines.length > 0 && (
          <Card sx={{ borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    <th style={thStyle}>Medicine</th>
                    <th style={thStyle}>Generic name</th>
                    <th style={thStyle}>Description</th>
                    <th style={thStyle}>Category</th>
                    <th style={thStyle}>Pharmacy</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Price</th>
                    <th style={{ ...thStyle, textAlign: "center" }}>Stock</th>
                    <th style={{ ...thStyle, textAlign: "center" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((med, idx) => {
                    const pharmacyName = med.pharmacy?.name ?? med.pharmacyId?.name ?? "Unknown pharmacy";
                    const outOfStock = med.stock === 0;
                    const favorited = isMedicineFavorited(med._id);
                    return (
                      <tr
                        key={med._id}
                        style={{
                          borderBottom: idx < medicines.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                          backgroundColor: "white",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#F9FBFD")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}
                      >
                        {/* Name */}
                        <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 28, height: 28, borderRadius: "7px", backgroundColor: "#EEF4FB", color: "#0D3B6E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <MedicalServicesOutlinedIcon sx={{ fontSize: 14 }} />
                            </Box>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary" }}>
                              {med.name}
                            </Typography>
                          </Box>
                        </td>

                        {/* Generic name */}
                        <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                          <Typography variant="caption" color="text.secondary">
                            {med.genericName || "—"}
                          </Typography>
                        </td>

                        {/* Description */}
                        <td style={{ padding: "10px 16px", maxWidth: 220 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {med.description || "—"}
                          </Typography>
                        </td>

                        {/* Category */}
                        <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                          <Typography variant="caption" color="text.secondary">
                            {med.category || "—"}
                          </Typography>
                        </td>

                        {/* Pharmacy */}
                        <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                          <Typography variant="caption" color="text.secondary">
                            {pharmacyName}
                          </Typography>
                        </td>

                        {/* Price */}
                        <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0D3B6E" }}>
                            ₱{med.price.toFixed(2)}
                          </Typography>
                        </td>

                        {/* Stock */}
                        <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <Chip
                            label={outOfStock ? "Out of stock" : `${med.stock} left`}
                            size="small"
                            color={outOfStock ? "error" : "success"}
                            variant="outlined"
                            sx={{ fontSize: "0.68rem" }}
                          />
                        </td>

                        {/* Actions */}
                        <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                            <IconButton size="small" onClick={() => handleToggleFavoriteMedicine(med, pharmacyName)}>
                              {favorited
                                ? <FavoriteIcon sx={{ fontSize: 16, color: "#E0457B" }} />
                                : <FavoriteBorderIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
                            </IconButton>
                            <IconButton
                              size="small"
                              disabled={outOfStock}
                              onClick={() => addToCart(med)}
                              sx={{
                                backgroundColor: outOfStock ? "rgba(0,0,0,0.06)" : "#0D3B6E",
                                color: "#fff",
                                width: 28,
                                height: 28,
                                "&:hover": { backgroundColor: outOfStock ? "rgba(0,0,0,0.06)" : "#0A2E55" },
                                "&.Mui-disabled": { color: "text.disabled" },
                              }}
                            >
                              <AddShoppingCartIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </Card>
        )}
      </Box>

      {/* ── STICKY CART BAR ── */}
      {cart.length > 0 && (
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            backgroundColor: "#fff",
            borderTop: "1px solid rgba(13,59,110,0.12)",
            boxShadow: "0 -4px 20px rgba(13,59,110,0.10)",
            mx: { xs: -1.5, sm: -2, md: -3 },
          }}
        >
          <Collapse in={cartExpanded}>
            <Box sx={{ maxHeight: "40vh", overflowY: "auto", px: 2, pt: 1.5 }}>
              {cart.map((item) => (
                <Box
                  key={item._id}
                  sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, py: 0.75 }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, px: 2, py: 1.25 }}>
            <Box
              onClick={() => setCartExpanded((prev) => !prev)}
              sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", flex: 1, minWidth: 0 }}
            >
              <Box sx={{ width: 34, height: 34, borderRadius: "9px", backgroundColor: "#5BC4A0", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
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
              {cartExpanded
                ? <ExpandMoreIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                : <ExpandLessIcon sx={{ fontSize: 18, color: "text.secondary" }} />}
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

      {/* ── CHECKOUT MODAL ── */}
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

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSnackbar({ open: false, message: "" })}
          sx={{ borderRadius: "10px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}