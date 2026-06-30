import {
  Box,
  Typography,
  Skeleton,
  Button,
  Chip,
} from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LocalPharmacyOutlinedIcon from "@mui/icons-material/LocalPharmacyOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import {
  isNearestQuery,
  isGenericMedicineQuery,
  isGenericPharmacyQuery,
} from "../../utils/searchintent";

interface IMedicineResult {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category?: string;
  genericName?: string;
  description?: string;
  pharmacyId?: { _id?: string; name: string };
  pharmacy?: { _id?: string; name: string };
}

interface IPharmacyResult {
  _id: string;
  name: string;
  address: string;
}

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

export default function Results() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";

  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<IMedicineResult[]>([]);
  const [pharmacies, setPharmacies] = useState<IPharmacyResult[]>([]);

  useEffect(() => {
    if (isNearestQuery(query)) {
      navigate("/user?nearest=true", { replace: true });
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) return;

    const wantsAllMedicines = isGenericMedicineQuery(trimmed);
    const wantsAllPharmacies = isGenericPharmacyQuery(trimmed);

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [medRes, pharmRes] = await Promise.all([
          api.get("/medicines", wantsAllMedicines ? {} : { params: { search: trimmed } }),
          api.get("/pharmacies"),
        ]);

        setMedicines(medRes.data || []);

        if (wantsAllPharmacies) {
          setPharmacies(pharmRes.data || []);
        } else {
          const lower = trimmed.toLowerCase();
          const matchedPharmacies = (pharmRes.data || []).filter((p: IPharmacyResult) =>
            p.name.toLowerCase().includes(lower)
          );
          setPharmacies(matchedPharmacies);
        }
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
    navigate(`/user?pharmacy=${pharmacyId}&addMedicine=${med._id}`, {
      state: { medicineToAdd: med },
    });
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
          {loading ? "Searching..." : hasResults ? "Tap a row to view it on the map." : " "}
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={44} />
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

    {/* ── Medicines table ── */}
{!loading && sortedMedicines.length > 0 && (
  <Box sx={{ mb: 3 }}>
    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 1.5 }}>
      Medicines · cheapest first
    </Typography>
    <Box sx={{ borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
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
            </tr>
          </thead>
          <tbody>
            {sortedMedicines.map((med, idx) => {
              const pharmacyName = med.pharmacy?.name ?? med.pharmacyId?.name ?? "Unknown pharmacy";
              const outOfStock = med.stock === 0;
              return (
                <tr
                  key={med._id}
                  style={{
                    borderBottom: idx < sortedMedicines.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    backgroundColor: "white",
                    cursor: outOfStock ? "default" : "pointer",
                    opacity: outOfStock ? 0.55 : 1,
                  }}
                  onClick={() => !outOfStock && handleSelectMedicine(med)}
                  onMouseEnter={(e) => { if (!outOfStock) e.currentTarget.style.backgroundColor = "#F9FBFD"; }}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
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

                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <Typography variant="caption" color="text.secondary">
                      {med.genericName || "—"}
                    </Typography>
                  </td>

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

                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <Typography variant="caption" color="text.secondary">
                      {med.category || "—"}
                    </Typography>
                  </td>
                  <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                    <Typography variant="caption" color="text.secondary">
                      {pharmacyName}
                    </Typography>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#0D3B6E" }}>
                      ₱{med.price.toFixed(2)}
                    </Typography>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "center", whiteSpace: "nowrap" }}>
                    <Chip
                      label={outOfStock ? "Out of stock" : `${med.stock} left`}
                      size="small"
                      color={outOfStock ? "error" : "success"}
                      variant="outlined"
                      sx={{ fontSize: "0.68rem" }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Box>
  </Box>
)}

      {/* ── Pharmacies table ── */}
      {!loading && pharmacies.length > 0 && (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "text.primary", mb: 1.5 }}>
            Pharmacies
          </Typography>
          <Box sx={{ borderRadius: "12px", overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC" }}>
                    <th style={thStyle}>Pharmacy</th>
                    <th style={thStyle}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacies.map((pharmacy, idx) => (
                    <tr
                      key={pharmacy._id}
                      style={{
                        borderBottom: idx < pharmacies.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                      onClick={() => handleSelectPharmacy(pharmacy)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F9FBFD")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                    >
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{ width: 28, height: 28, borderRadius: "7px", backgroundColor: "#EEF4FB", color: "#0D3B6E", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <LocalPharmacyOutlinedIcon sx={{ fontSize: 14 }} />
                          </Box>
                          <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "text.primary" }}>
                            {pharmacy.name}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <Typography variant="caption" color="text.secondary">
                          {pharmacy.address}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}