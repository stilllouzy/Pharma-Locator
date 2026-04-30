import { Box, Typography, Button } from "@mui/material";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import Dashboard from "../pages/rider/RiderDashboard";
import MyDeliveries from "../pages/rider/MyDeliveries";
import DeliveryHistory from "../pages/rider/DeliveryHistory";
import Profile from "../pages/rider/RiderProfile";
import DeliveryDetails from "../pages/rider/DeliveryDetails";
import DeliveryMapView from "../pages/rider/DeliveryMapView";

const riderLinks = [
  { label: "Dashboard", path: "/rider/dashboard" },
  { label: "My Deliveries", path: "/rider/deliveries" },
  { label: "Delivery History", path: "/rider/history" },
  { label: "Profile", path: "/rider/profile" },
  {label : "Deliver Map", path: "/rider/map"},
];

export default function RiderLayout() {
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
          Rider Panel
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {riderLinks.map((item) => (
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
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deliveries" element={<MyDeliveries />} />
          <Route path="history" element={<DeliveryHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="detail/:id" element={<DeliveryDetails/>} />
          <Route path="map" element={<DeliveryMapView/>}/>
        </Routes>
      </Box>

    </Box>
  );
}