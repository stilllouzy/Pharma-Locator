import { Box, Typography, Button } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

const riderLinks = [
  { label: "Dashboard", path: "/rider/dashboard" },
  { label: "My Deliveries", path: "/rider/deliveries" },
  { label: "Delivery History", path: "/rider/history" },
  { label: "Profile", path: "/rider/profile" },
  {label : "Deliver Map", path: "/rider/map"},
];

export default function RiderSiderBar() {
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

    </Box>
  );
}