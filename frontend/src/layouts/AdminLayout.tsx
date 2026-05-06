import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../layouts/Navbar/AdminSidebar";

// ADMIN PAGES
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

export default function AdminLayout() {
  return (
    <Box sx={{ display: "flex" }}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: "#f5f5f5" }}>
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