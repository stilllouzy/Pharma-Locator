import { Box, Typography, Button } from "@mui/material";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Medicines from "../pages/pharmacy/Medicines";
import Orders from "../pages/pharmacy/Orders";
import Prescriptions from "../pages/pharmacy/PharmaPrescriptions";

const pharmacyLinks = [
  { label: "Medicines", path: "/pharmacy/medicines" },
  { label: "Orders", path: "/pharmacy/orders" },
  { label: "Prescriptions", path: "/pharmacy/prescriptions" },
];

export default function PharmacyLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>

      {/* SIDEBAR */}
      <Box
        sx={{
          width: 260,
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
          p: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontWeight: "bold", mb: 3 }}>
          Pharmacy Panel
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {pharmacyLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2563eb" : "#374151",
                background: isActive ? "#e5e7eb" : "transparent",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

        {/* LOGOUT */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button fullWidth variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5" }}>
        <Routes>
          <Route path="medicines" element={<Medicines />} />
          <Route path="orders" element={<Orders />} />
          <Route path="prescriptions" element={<Prescriptions />} />
        </Routes>
      </Box>

    </Box>
  );
}