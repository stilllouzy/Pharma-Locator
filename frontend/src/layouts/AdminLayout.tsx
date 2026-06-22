import { Box, IconButton, AppBar, Toolbar, Typography, Badge } from "@mui/material";
import { Routes, Route, useLocation, Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Sidebar, { DRAWER_WIDTH, RAIL_WIDTH } from "../navbar/AdminSidebar";

import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/UserManagement";
import Pharmacies from "../pages/admin/PharmaManagement";
import Medicines from "../pages/admin/MedManagement";
import Orders from "../pages/admin/OrderManagement";
import Notifications from "../pages/admin/Notifications";
import Reports from "../pages/admin/ReportsAnalytics";
import Settings from "../pages/admin/SettingsModule";

// Maps a route segment to a readable label for the breadcrumb trail.
const LABELS: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  pharmacies: "Pharmacies",
  medicines: "Medicines",
  orders: "Orders",
  notifications: "Notifications",
  reports: "Reports",
  settings: "Settings",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  let path = "";
  const crumbs = segments.map((seg) => {
    path += `/${seg}`;
    return { label: LABELS[seg] ?? seg, path };
  });

  // Always start from Admin / Dashboard even on the index route.
  if (crumbs.length === 0) {
    crumbs.push({ label: "Admin", path: "/admin" });
  }
  return crumbs;
}

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const crumbs = useBreadcrumbs();

  const sidebarWidth = open ? DRAWER_WIDTH : RAIL_WIDTH;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={open} />

      {/* TOP APP BAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#fff",
          color: "text.primary",
          borderBottom: "0.5px solid rgba(13,59,110,0.12)",
          boxShadow: "none",
          width: `calc(100% - ${sidebarWidth}px)`,
          ml: `${sidebarWidth}px`,
          transition: "width 0.25s ease, margin 0.25s ease",
        }}
      >
        <Toolbar sx={{ minHeight: 64, gap: 1.5 }}>
          <IconButton onClick={() => setOpen(!open)} sx={{ color: "#0D3B6E" }}>
            {open ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>

          {/* Breadcrumbs */}
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              {crumbs.map((crumb, i) => {
                const isLast = i === crumbs.length - 1;
                return (
                  <Box key={crumb.path} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {i > 0 && (
                      <ChevronRightIcon sx={{ fontSize: 15, color: "text.disabled" }} />
                    )}
                    {isLast ? (
                      <Typography
                        sx={{ fontSize: "0.95rem", fontWeight: 600, color: "text.primary" }}
                      >
                        {crumb.label}
                      </Typography>
                    ) : (
                      <Typography
                        component={RouterLink}
                        to={crumb.path}
                        sx={{
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "text.secondary",
                          textDecoration: "none",
                          "&:hover": { color: "#0D3B6E" },
                        }}
                      >
                        {crumb.label}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Right cluster */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              sx={{
                width: 36,
                height: 36,
                border: "0.5px solid rgba(13,59,110,0.16)",
                borderRadius: "8px",
                color: "text.secondary",
              }}
            >
              <Badge color="error" variant="dot" overlap="circular">
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
              </Badge>
            </IconButton>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                backgroundColor: "#0D3B6E",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12.5,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              AD
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          backgroundColor: "#F4F7FB",
          ml: `${sidebarWidth}px`,
          mt: "64px",
          transition: "margin 0.25s ease",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="pharmacies" element={<Pharmacies />} />
            <Route path="medicines" element={<Medicines />} />
            <Route path="orders" element={<Orders />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}