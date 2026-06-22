import {
  Box,
  Typography,
  Card,
  CardContent,
  Skeleton,
  Button,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import { isNearestQuery } from "../../utils/searchintent";

interface IMedicineResult {
  _id: string;
  name: string;
  price: number;
  stock: number;
  pharmacyId?: { _id?: string; name: string };
  pharmacy?: { _id?: string; name: string };
}

interface IPharmacyResult {
  _id: string;
  name: string;
  address: string;
}

export default function Results() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";

  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<IMedicineResult[]>([]);
  const [pharmacies, setPharmacies] = useState<IPharmacyResult[]>([]);

  useEffect(() => {
    // "Near me" / "nearby" bypasses the results list entirely.
    if (isNearestQuery(query)) {
      navigate("/user?nearest=true", { replace: true });
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [medRes, pharmRes] = await Promise.all([
          api.get("/medicines", { params: { search: trimmed } }),
          api.get("/pharmacies"),
        ]);

        setMedicines(medRes.data || []);

        const lower = trimmed.toLowerCase();
        const matchedPharmacies = (pharmRes.data || []).filter((p: IPharmacyResult) =>
          p.name.toLowerCase().includes(lower)
        );
        setPharmacies(matchedPharmacies);
      } catch (error) {
        console.error(error);
        setMedicines([]);
        setPharmacies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  const sortedMedicines = [...medicines].sort((a, b) => a.price - b.price);
  const hasResults = sortedMedicines.length > 0 || pharmacies.length > 0;

  const handleSelectMedicine = (med: IMedicineResult) => {
    const pharmacyId = med.pharmacy?._id ?? med.pharmacyId?._id;
    if (!pharmacyId) return;
    navigate(`/user?pharmacy=${pharmacyId}&addMedicine=${med._id}`);
  };

  const handleSelectPharmacy = (pharmacy: IPharmacyResult) => {
    navigate(`/user?pharmacy=${pharmacy._id}`);
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary", mb: 0.25 }}>
          Results for "{query}"
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {loading ? "Searching..." : hasResults ? "Tap a result to view it on the map." : " "}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={64} />
          ))}
        </Box>
      )}

      {!loading && !hasResults && (
        <Box
          sx={{
            py: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            backgroundColor: "#fff",
            borderRadius: "12px",
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 36, color: "text.disabled" }} />
          <Typography variant="body2" color="text.secondary">
            No medicines or pharmacies matched "{query}".
          </Typography>
          <Button
            startIcon={<NearMeOutlinedIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate("/user?nearest=true")}
            sx={{ fontSize: "0.8rem", color: "#0D3B6E" }}
          >
            Find the nearest pharmacy instead
          </Button>
        </Box>
      )}

      {!loading && sortedMedicines.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 1.5 }}>
            Medicines · cheapest first
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {sortedMedicines.map((med) => {
              const pharmacyName = med.pharmacy?.name ?? med.pharmacyId?.name ?? "Unknown pharmacy";
              const outOfStock = med.stock === 0;
              return (
                <Card
                  key={med._id}
                  sx={{
                    borderRadius: "10px",
                    cursor: outOfStock ? "default" : "pointer",
                    opacity: outOfStock ? 0.55 : 1,
                    "&:hover": outOfStock ? {} : { boxShadow: "0 2px 10px rgba(13,59,110,0.12)" },
                  }}
                  onClick={() => !outOfStock && handleSelectMedicine(med)}
                >
                  <CardContent
                    sx={{
                      py: "12px !important",
                      px: "16px !important",
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "9px",
                        backgroundColor: "#EEF4FB",
                        color: "#0D3B6E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MedicalServicesOutlinedIcon sx={{ fontSize: 17 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{med.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {pharmacyName} · {outOfStock ? "Out of stock" : `${med.stock} left`}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0D3B6E", flexShrink: 0 }}>
                      ₱{med.price.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {!loading && pharmacies.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 1.5 }}>
            Pharmacies
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {pharmacies.map((pharmacy) => (
              <Card
                key={pharmacy._id}
                sx={{
                  borderRadius: "10px",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 2px 10px rgba(13,59,110,0.12)" },
                }}
                onClick={() => handleSelectPharmacy(pharmacy)}
              >
                <CardContent
                  sx={{
                    py: "12px !important",
                    px: "16px !important",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "9px",
                      backgroundColor: "#EEF4FB",
                      color: "#0D3B6E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <LocalPharmacyOutlinedIcon sx={{ fontSize: 17 }} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{pharmacy.name}</Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {pharmacy.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}