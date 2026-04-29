import { Box, Drawer, List, ListItemText,ListItemButton } from "@mui/material";
import { Link, Routes, Route } from "react-router-dom";
import Medicines from "../pages/pharmacy/Medicines";

export default function PharmacyLayout() {
  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Drawer variant="permanent" sx={{ width: 240 }}>
        <List>
          <ListItemButton component={Link} to="/pharmacy/medicines">
            <ListItemText primary="Medicines" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* CONTENT */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="medicines" element={<Medicines />} />
        </Routes>
      </Box>
    </Box>
  );
}
