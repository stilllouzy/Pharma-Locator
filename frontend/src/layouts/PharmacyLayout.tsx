import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../layouts/Navbar/PharmaSidebar";

//PHARMACY PAGES
import Medicines from "../pages/pharmacy/Medicines";
import Orders from "../pages/pharmacy/Orders";
import Prescriptions from "../pages/pharmacy/PharmaPrescriptions";


export default function PharmacyLayout() {
  return (
    <Box sx={{ display: "flex" }}>

      {/* SIDEBAR */}
        <Sidebar />
      
      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 3, backgroundColor: "#f5f5f5" }}>
        <Routes>
          <Route path="medicines" element={<Medicines />} />
          <Route path="orders" element={<Orders />} />
          <Route path="prescriptions" element={<Prescriptions />} />
        </Routes>
      </Box>

    </Box>
  );
}