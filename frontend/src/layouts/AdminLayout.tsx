import { Box, IconButton, AppBar, Toolbar, Typography } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Sidebar from "./navbar/AdminSidebar";

import Dashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/UserManagement";
import Pharmacies from "../pages/admin/PharmaManagement";
import Medicines from "../pages/admin/MedManagement";
import Orders from "../pages/admin/OrderManagement";
import MapModule from "../pages/admin/MapModule";
import Notifications from "../pages/admin/Notifications";
import Reports from "../pages/admin/ReportsAnalytics";
import Roles from "../pages/admin/RoleAccessControl";
import Settings from "../pages/admin/SettingsModule";

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
            Pharma Locator — Admin
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
          <Route path="/" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="medicines" element={<Medicines />} />
          <Route path="orders" element={<Orders />} />
          <Route path="map" element={<MapModule />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route path="roles" element={<Roles />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Box>

    </Box>
  );
}