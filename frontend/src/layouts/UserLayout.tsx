import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import  MenuIcon  from "@mui/icons-material/Menu";
import Sidebar from "../navbar/UserSidebar";

// USER PAGES
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
import Prescriptions from "../pages/user/UserPrescriptions";
import OrderTracking from "../pages/user/OrderTracking";
import Payment from "../pages/user/Payment"
import Notifications from "../pages/user/UserNotification";

const DRAWER_WIDTH = 260;

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>

      {/* TOP APP BAR */}
      <AppBar
  position="fixed"
  sx={{
    zIndex: (theme) => theme.zIndex.drawer + 1,
    backgroundColor: "white",
    color: "black",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    width: { xs: "100%", md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
    ml: { xs: 0, md: open ? `${DRAWER_WIDTH}px` : 0 },
    transition: "width 0.3s, margin 0.3s",
  }}
>
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setOpen(!open)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: "bold", color : "white" }}>
            Pharma Locator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Sidebar open={open} />

      {/* MAIN CONTENT */}
      <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: { xs: 1, sm: 2, md: 3 },
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
    mt: "64px",
    ml: { xs: 0, md: open ? `${DRAWER_WIDTH}px` : 0 },
    width: { xs: "100%", md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%" },
    transition: "margin 0.3s, width 0.3s",
    overflowX: "hidden",
  }}
>
      
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
          <Route path="/track/:id" element={<OrderTracking />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Box>

    </Box>
  );
}