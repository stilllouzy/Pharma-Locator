import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import  MenuIcon  from "@mui/icons-material/Menu";
import Sidebar from "../navbar/PharmaSidebar";

//PHARMACY PAGES
import Medicines from "../pages/pharmacy/Medicines";
import Orders from "../pages/pharmacy/Orders";
import Prescriptions from "../pages/pharmacy/PharmaPrescriptions";


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
            Pharma Locator — Pharmacy side
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
          <Route path="medicines" element={<Medicines />} />
          <Route path="orders" element={<Orders />} />
          <Route path="prescriptions" element={<Prescriptions />} />
        </Routes>
      </Box>

    </Box>
  );
}