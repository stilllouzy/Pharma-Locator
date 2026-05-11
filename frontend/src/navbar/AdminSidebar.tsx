import {
  Drawer,
  Box,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

const DRAWER_WIDTH = 260;

const sections = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", path: "/admin" }],
  },
  {
    title: "Management",
    links: [
      { label: "User Management", path: "/admin/users" },
      { label: "Pharmacy Management", path: "/admin/pharmacies" },
      { label: "Medicine Management", path: "/admin/medicines" },
      { label: "Order / Reservation", path: "/admin/orders" },
    ],
  },
  {
    title: "System",
    links: [
      { label: "Map / Location", path: "/admin/map" },
      { label: "Notifications", path: "/admin/notifications" },
      { label: "Reports & Analytics", path: "/admin/reports" },
      { label: "Role & Access Control", path: "/admin/roles" },
      { label: "Settings", path: "/admin/settings" },
    ],
  },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          p: 2,
        }}
      >
        {/* BRAND */}
        <Typography sx={{ fontWeight: "bold", fontSize: 18, mb: 2 }}>
          Admin Panel
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* SECTIONS */}
        <Box sx={{ flexGrow: 1 }}>
          {sections.map((section) => (
            <Box key={section.title} sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  color: "gray",
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {section.title}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {section.links.map((item) => (
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
                    })}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* LOGOUT */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}