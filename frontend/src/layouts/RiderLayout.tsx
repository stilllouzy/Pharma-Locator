import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route, useLocation, Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Sidebar, { DRAWER_WIDTH, RAIL_WIDTH } from "../navbar/RiderSidebar";

// RIDER PAGES
import Dashboard from "../pages/rider/RiderDashboard";
import MyDeliveries from "../pages/rider/MyDeliveries";
import DeliveryHistory from "../pages/rider/DeliveryHistory";
import Profile from "../pages/rider/RiderProfile";
import DeliveryDetails from "../pages/rider/DeliveryDetails";
import DeliveryMapView from "../pages/rider/DeliveryMapView";

// Maps a route segment to a readable label for the breadcrumb trail.
const LABELS: Record<string, string> = {
  rider: "Rider",
  deliveries: "My deliveries",
  history: "Delivery history",
  profile: "Profile",
  detail: "Delivery detail",
  map: "Delivery map",
};

function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  let path = "";
  const crumbs = segments.map((seg) => {
    path += `/${seg}`;
    return { label: LABELS[seg] ?? seg, path };
  });

  if (crumbs.length === 0) {
    crumbs.push({ label: "Rider", path: "/rider" });
  }
  return crumbs;
}

export default function RiderLayout() {
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
                    {i > 0 && <ChevronRightIcon sx={{ fontSize: 15, color: "text.disabled" }} />}
                    {isLast ? (
                      <Typography sx={{ fontSize: "0.95rem", fontWeight: 600, color: "text.primary" }}>
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
            RD
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
            <Route path="deliveries" element={<MyDeliveries />} />
            <Route path="history" element={<DeliveryHistory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="detail/:id" element={<DeliveryDetails />} />
            <Route path="map" element={<DeliveryMapView />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}