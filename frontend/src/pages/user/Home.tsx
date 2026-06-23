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
  // Free-text search no longer filters here — it navigates to /user/results instead.
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

  // If we arrived from a search result with ?addMedicine=<id>, the medicine's
  // full data was passed via navigation state (no GET /medicines/:id exists
  // on the backend) — add it to cart, confirm via snackbar, then strip the
  // param so refreshing the page doesn't re-add it.
  useEffect(() => {
    if (!addMedicineId) return;

    const state = location.state as { medicineToAdd?: IMedicine } | null;
    const medicine = state?.medicineToAdd;

    if (medicine && medicine._id === addMedicineId) {
      setCart((prev) => {
        const existing = prev.find((item) => item._id === medicine._id);
        if (existing) {
          return prev.map((item) =>
            item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { ...medicine, quantity: 1 }];
      });
      setSnackbar({ open: true, message: `${medicine.name} added to your cart.` });
    } else {
      // Arrived without the expected state (e.g. direct link, refresh, or
      // browser back/forward) — nothing to add, let the user know gently.
      setSnackbar({ open: true, message: "Open that medicine from the search results to add it." });
    }

    const next = new URLSearchParams(params);
    next.delete("addMedicine");
    navigate(`/user?${next.toString()}`, { replace: true, state: {} });
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
      {/* SEARCH */}
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary", mb: 0.25 }}>
          Find medicine near you
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Search a medicine or pharmacy, or try "pharmacy near me".
        </Typography>

        <TextField
          fullWidth
          placeholder="Search medicine, pharmacy, or 'near me'"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
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

      {/* MAP */}
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

      {/* CONTEXT CHIP — shown once a pharmacy filter is active */}
      {selectedPharmacy && (
        <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
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
          <IconButton size="small" onClick={handleToggleFavoritePharmacy}>
            {isPharmacyFavorited(selectedPharmacy) ? (
              <FavoriteIcon sx={{ fontSize: 18, color: "#E0457B" }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: 18, color: "text.disabled" }} />
            )}
          </IconButton>
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
              const favorited = isMedicineFavorited(med._id);
              return (
                <Card key={med._id} sx={{ borderRadius: "12px", position: "relative" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleFavoriteMedicine(med, pharmacyName)}
                    sx={{ position: "absolute", top: 4, right: 4, zIndex: 1, p: 0.5 }}
                  >
                    {favorited ? (
                      <FavoriteIcon sx={{ fontSize: 16, color: "#E0457B" }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                    )}
                  </IconButton>

                  <CardContent sx={{ p: "10px 12px !important" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5, pr: 2.5 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "6px",
                          backgroundColor: "#EEF4FB",
                          color: "#0D3B6E",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <MedicalServicesOutlinedIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {med.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
                      <Typography sx={{ fontSize: "0.78rem", color: "#0D3B6E", fontWeight: 600 }}>
                        ₱{med.price.toFixed(2)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: outOfStock ? "#C62828" : "text.disabled", fontSize: "0.68rem" }}
                      >
                        {outOfStock ? "Out of stock" : `${med.stock} left`}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "0.68rem",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {pharmacyName}
                      </Typography>

                      <IconButton
                        size="small"
                        disabled={outOfStock}
                        onClick={() => addToCart(med)}
                        sx={{
                          backgroundColor: outOfStock ? "rgba(0,0,0,0.06)" : "#0D3B6E",
                          color: "#fff",
                          width: 26,
                          height: 26,
                          flexShrink: 0,
                          "&:hover": { backgroundColor: outOfStock ? "rgba(0,0,0,0.06)" : "#0A2E55" },
                          "&.Mui-disabled": { color: "text.disabled" },
                        }}
                      >
                        <AddShoppingCartIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
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

      {/* SEARCH-RESULT FEEDBACK */}
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