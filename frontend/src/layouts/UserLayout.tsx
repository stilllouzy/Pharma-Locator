import { Box, Typography, Button } from "@mui/material";
import { Routes, Route, useNavigate, NavLink } from "react-router-dom";
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
import Prescriptions from "../pages/user/UserPrescriptions"
export default function UserLayout() {
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
    Pharma Locator
  </Typography>

  {/* NAV LINKS */}
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {[
      { label: "Home", path: "/user" },
      { label: "Map", path: "/user/map" },
      { label: "Orders", path: "/user/orders" },
      { label: "Prescriptions", path: "/user/prescription" },
    ].map((item) => (
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

  {/* LOGOUT — pushed to bottom */}
  <Box sx={{ mt: "auto", pt: 2 }}>
    <Button fullWidth variant="outlined" color="error" onClick={handleLogout}>
      Logout
    </Button>
  </Box>
</Box>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/map"
            element={
              <MapView onSelectPharmacy={(id) => console.log("Selected pharmacy:", id)} />
            }
          />
          <Route path="/orders" element={<Orders />} />
          <Route path="/prescription" element={<Prescriptions />} />
        </Routes>
      </Box>

    </Box>
  );
}