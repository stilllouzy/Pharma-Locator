import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../layouts/Navbar/RiderSidebar";

// RIDER PAGES
import Dashboard from "../pages/rider/RiderDashboard";
import MyDeliveries from "../pages/rider/MyDeliveries";
import DeliveryHistory from "../pages/rider/DeliveryHistory";
import Profile from "../pages/rider/RiderProfile";
import DeliveryDetails from "../pages/rider/DeliveryDetails";
import DeliveryMapView from "../pages/rider/DeliveryMapView";


export default function RiderLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Sidebar/>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5" }}>
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