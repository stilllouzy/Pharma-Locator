import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./navbar/UserSidebar";

// USER PAGES
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
import Prescriptions from "../pages/user/UserPrescriptions";
import OrderTracking from "../pages/user/OrderTracking";
import Payment from "../pages/user/Payment"
export default function UserLayout() {

  return (
    <Box sx={{ display: "flex" }}>

      {/* SIDEBAR */}
         <Sidebar />

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, backgroundColor: "#f5f5f5" }}>
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