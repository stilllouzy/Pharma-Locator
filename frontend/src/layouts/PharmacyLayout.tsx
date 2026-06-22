import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route, useLocation, Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Sidebar, { DRAWER_WIDTH, RAIL_WIDTH } from "../navbar/PharmaSidebar";

// PHARMACY PAGES
import Medicines from "../pages/pharmacy/Medicines";
import Orders from "../pages/pharmacy/Orders";
import Prescriptions from "../pages/pharmacy/PharmaPrescriptions";
import ProofOfDelivery from "../pages/pharmacy/ProofOfDelivery";

// Maps a route segment to a readable label for the breadcrumb trail.
const LABELS: Record<string, string> = {
  pharmacy: "Pharmacy",
  orders: "Orders",
  prescriptions: "Prescriptions",
  pod: "Proof of delivery",
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
    crumbs.push({ label: "Pharmacy", path: "/pharmacy" });
  }
  return crumbs;
}

export default function PharmaLayout() {
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
            PH
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
            <Route path="/" element={<Medicines />} />
            <Route path="orders" element={<Orders />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="pod" element={<ProofOfDelivery />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}