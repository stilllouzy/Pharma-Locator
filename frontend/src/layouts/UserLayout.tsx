import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";
export default function UserLayout() {
  return (
    <Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
  path="/map"
  element={
    <MapView
      onSelectPharmacy={(id) => {
        console.log("Selected pharmacy:", id);
      }}
    />
  }
/>
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Box>
  );
}