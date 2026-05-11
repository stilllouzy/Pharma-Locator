import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import  MenuIcon  from "@mui/icons-material/Menu";
import Sidebar from "../layouts/navbar/UserSidebar";

// USER PAGES
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
import Prescriptions from "../pages/user/UserPrescriptions";
import OrderTracking from "../pages/user/OrderTracking";
import Payment from "../pages/user/Payment"

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
          p: 3,
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          mt: "64px", // offset for AppBar height
          transition: "margin 0.3s",
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
        </Routes>
      </Box>

    </Box>
  );
}