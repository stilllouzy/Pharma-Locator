import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import  MenuIcon  from "@mui/icons-material/Menu";
import Sidebar from "../layouts/navbar/RiderSidebar";

// RIDER PAGES
import Dashboard from "../pages/rider/RiderDashboard";
import MyDeliveries from "../pages/rider/MyDeliveries";
import DeliveryHistory from "../pages/rider/DeliveryHistory";
import Profile from "../pages/rider/RiderProfile";
import DeliveryDetails from "../pages/rider/DeliveryDetails";
import DeliveryMapView from "../pages/rider/DeliveryMapView";


const DRAWER_WIDTH = 260;

export default function AdminLayout() {
  const [open, setOpen] = useState(true);

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
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          ml: open ? `${DRAWER_WIDTH}px` : 0,
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
          <Typography sx={{ fontWeight: "bold" }}>
            Pharma Locator — Rider
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
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          mt: "64px", // offset for AppBar height
          transition: "margin 0.3s",
        }}
      >
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