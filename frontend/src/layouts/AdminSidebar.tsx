import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const sections = [
  {
    title: "Overview",
    links: [
      { label: "Dashboard", path: "/admin" },
    ],
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

export default function Sidebar() {
  return (
    <Box
      sx={{
        width: 260,
        backgroundColor: "white",
        borderRight: "1px solid #e5e7eb",
        p: 2,
      }}
    >
      {/* BRAND */}
      <Typography sx={{ fontWeight: "bold", mb: 3 }}>
        Admin Panel
      </Typography>

      {/* SECTIONS */}
      {sections.map((section) => (
        <Box key={section.title} sx={{ mb: 2 }}>
          
          {/* SECTION TITLE */}
          <Typography
            sx={{
              fontSize: 12,
              color: "gray",
              mb: 1,
              textTransform: "uppercase",
            }}
          >
            {section.title}
          </Typography>

          {/* LINKS */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {section.links.map((item) => (
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

        </Box>
      ))}
    </Box>
  );
}