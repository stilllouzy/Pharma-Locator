import { Drawer, Box, Typography, Button, Divider } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 260;

const riderLinks = [
  { label: "Dashboard", path: "/rider/dashboard" },
  { label: "My Deliveries", path: "/rider/deliveries" },
  { label: "Delivery History", path: "/rider/history" },
  { label: "Delivery Map", path: "/rider/map" },
  { label: "Profile", path: "/rider/profile" },
];

interface SidebarProps {
  open: boolean;
}

export default function RiderSidebar({ open }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>

        <Typography sx={{ fontWeight: "bold", fontSize: 18, mb: 2 }}>
          Rider Panel
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flexGrow: 1 }}>
          {riderLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2563eb" : "#374151",
                backgroundColor: isActive ? "#eff6ff" : "transparent",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                display: "block",
                transition: "all 0.2s",
                marginBottom: "4px",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Button fullWidth variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}