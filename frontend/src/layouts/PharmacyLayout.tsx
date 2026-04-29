import { Box, Drawer, List, ListItemButton, ListItemText } from "@mui/material";
import { Link, Routes, Route } from "react-router-dom";
import Medicines from "../pages/pharmacy/Medicines";
import Orders from "../pages/pharmacy/Orders";
export default function PharmacyLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Drawer variant="permanent" sx={{ width: 240 }}>
        <List>
          <ListItemButton component={Link} to="/pharmacy/medicines">
            <ListItemText primary="Medicines" />
          </ListItemButton>
          <ListItemButton component={Link} to="/pharmacy/orders">
            <ListItemText primary="Orders" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="medicines" element={<Medicines />} />
          <Route path="orders" element={<Orders />} />
        </Routes>
      </Box>
    </Box>
  );
}
