import { Box, Typography, Card, CardContent, IconButton, Tabs, Tab } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadFavorites,
  toggleFavoriteMedicine,
  toggleFavoritePharmacy,
  notifyFavoritesChanged,
  FAVORITES_CHANGED_EVENT,
  type IFavoriteMedicine,
  type IFavoritePharmacy,
} from "../../utils/favorites";

export default function Favorites() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"medicines" | "pharmacies">("medicines");
  const [medicines, setMedicines] = useState<IFavoriteMedicine[]>([]);
  const [pharmacies, setPharmacies] = useState<IFavoritePharmacy[]>([]);

  const refresh = () => {
    const data = loadFavorites();
    setMedicines(data.medicines);
    setPharmacies(data.pharmacies);
  };

  useEffect(() => {
    refresh();
    window.addEventListener(FAVORITES_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, refresh);
  }, []);

  const handleUnfavoriteMedicine = (medicine: IFavoriteMedicine) => {
    toggleFavoriteMedicine(medicine);
    notifyFavoritesChanged();
    refresh();
  };

  const handleUnfavoritePharmacy = (pharmacy: IFavoritePharmacy) => {
    toggleFavoritePharmacy(pharmacy);
    notifyFavoritesChanged();
    refresh();
  };

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary", mb: 0.25 }}>
          Favorites
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Medicines you take often and pharmacies you trust.
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, val) => setTab(val)}
        sx={{
          mb: 2,
          minHeight: 36,
          "& .MuiTab-root": { minHeight: 36, fontSize: "0.82rem", textTransform: "none", fontWeight: 600 },
          "& .Mui-selected": { color: "#0D3B6E !important" },
          "& .MuiTabs-indicator": { backgroundColor: "#5BC4A0" },
        }}
      >
        <Tab label={`Medicines (${medicines.length})`} value="medicines" />
        <Tab label={`Pharmacies (${pharmacies.length})`} value="pharmacies" />
      </Tabs>

      {tab === "medicines" && (
        <>
          {medicines.length === 0 ? (
            <EmptyState
              icon={<MedicalServicesOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />}
              text="No favorite medicines yet."
              hint="Tap the heart icon on a medicine you take often."
            />
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
                gap: 1.5,
              }}
            >
              {medicines.map((med) => (
                <Card key={med._id} sx={{ borderRadius: "12px", position: "relative" }}>
                  <IconButton
                    size="small"
                    onClick={() => handleUnfavoriteMedicine(med)}
                    sx={{ position: "absolute", top: 6, right: 6, zIndex: 1 }}
                  >
                    <FavoriteIcon sx={{ fontSize: 17, color: "#E0457B" }} />
                  </IconButton>
                  <CardContent sx={{ p: "12px !important" }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "9px",
                        backgroundColor: "#EEF4FB",
                        color: "#0D3B6E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <MedicalServicesOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        pr: 2,
                      }}
                    >
                      {med.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#0D3B6E", fontWeight: 600, mt: 0.25 }}>
                      ₱{med.price.toFixed(2)}
                    </Typography>
                    {med.pharmacyName && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {med.pharmacyName}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {tab === "pharmacies" && (
        <>
          {pharmacies.length === 0 ? (
            <EmptyState
              icon={<LocalPharmacyOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />}
              text="No favorite pharmacies yet."
              hint="Tap the heart icon on a pharmacy's map popup."
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {pharmacies.map((pharmacy) => (
                <Card key={pharmacy._id} sx={{ borderRadius: "12px" }}>
                  <CardContent
                    sx={{
                      p: "14px 16px !important",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        backgroundColor: "#EEF4FB",
                        color: "#0D3B6E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <LocalPharmacyOutlinedIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                        {pharmacy.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {pharmacy.address}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/user?pharmacy=${pharmacy._id}`)}
                        title="View medicines"
                      >
                        <MedicalServicesOutlinedIcon sx={{ fontSize: 18, color: "#0D3B6E" }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleUnfavoritePharmacy(pharmacy)}>
                        <FavoriteIcon sx={{ fontSize: 18, color: "#E0457B" }} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function EmptyState({ icon, text, hint }: { icon: React.ReactNode; text: string; hint: string }) {
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        backgroundColor: "#fff",
        borderRadius: "12px",
      }}
    >
      {icon}
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
      <Typography variant="caption" color="text.disabled">
        {hint}
      </Typography>
    </Box>
  );
}