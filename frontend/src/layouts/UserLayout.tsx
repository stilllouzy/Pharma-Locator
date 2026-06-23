import { Box, IconButton, AppBar, Toolbar, Typography, useMediaQuery, type Theme } from "@mui/material";
import { Routes, Route, useLocation, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Sidebar, { DRAWER_WIDTH, RAIL_WIDTH } from "../navbar/UserSidebar";
import NotificationBell from "../pages/user/NotifBell";

// USER PAGES
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
import Prescriptions from "../pages/user/UserPrescriptions";
import OrderTracking from "../pages/user/OrderTracking";
import Payment from "../pages/user/Payment";
import Notifications from "../pages/user/UserNotification";
import Favorites from "../pages/user/Favorites";
import Results from "../pages/user/Result";

// Maps a route segment to a readable label for the breadcrumb trail.
const LABELS: Record<string, string> = {
  user: "Home",
  map: "Map",
  favorites: "Favorites",
  results: "Search results",
  orders: "Orders",
  prescription: "Prescriptions",
  track: "Order tracking",
  payment: "Payment",
  notifications: "Notifications",
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
    crumbs.push({ label: "Home", path: "/user" });
  }
  return crumbs;
}

export default function UserLayout() {
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  // Desktop: sidebar starts expanded. Mobile: sidebar starts closed (overlay, hidden by default).
  const [open, setOpen] = useState(!isMobile);
  const crumbs = useBreadcrumbs();

  // Keep `open` in sync if the viewport crosses the breakpoint after mount
  // (e.g. resizing the browser window, or rotating a tablet).
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const sidebarWidth = open ? DRAWER_WIDTH : RAIL_WIDTH;
  // On mobile the sidebar is an overlay — it never pushes content over.
  const contentOffset = isMobile ? 0 : sidebarWidth;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar open={open} onClose={() => setOpen(false)} />

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
          width: `calc(100% - ${contentOffset}px)`,
          ml: `${contentOffset}px`,
          transition: "width 0.25s ease, margin 0.25s ease",
        }}
      >
        <Toolbar sx={{ minHeight: 64, gap: 1.5 }}>
          <IconButton
            onClick={(e) => {
              e.currentTarget.blur();
              setOpen(!open);
            }}
            sx={{ color: "#0D3B6E" }}
          >
            {open && !isMobile ? <MenuOpenIcon /> : <MenuIcon />}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <NotificationBell />
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
              US
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
          ml: `${contentOffset}px`,
          mt: "64px",
          transition: "margin 0.25s ease",
          overflowX: "hidden",
          width: `calc(100% - ${contentOffset}px)`,
        }}
      >
        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/map"
              element={
                <Box
                  sx={{
                    height: "calc(100vh - 64px - 48px)",
                    minHeight: 400,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <MapView
                    onSelectPharmacy={(id: string, name?: string) =>
                      console.log("Selected pharmacy:", id, name)
                    }
                  />
                </Box>
              }
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/results" element={<Results />} />
            <Route path="/prescription" element={<Prescriptions />} />
            <Route path="/track/:id" element={<OrderTracking />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}