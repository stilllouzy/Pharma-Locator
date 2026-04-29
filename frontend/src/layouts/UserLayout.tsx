import { Box, Typography, Button } from "@mui/material";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "../pages/user/Home";
import MapView from "../pages/user/MapView";
import Orders from "../pages/user/Orders";

export default function UserLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>

      {/* SIDEBAR */}
      <Box
        sx={{
          width: 260,
          backgroundColor: "white",
          borderRight: "1px solid #e5e7eb",
          p: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography sx={{ fontWeight: "bold", mb: 3 }}>
          Pharma Locator
        </Typography>

        {/* LOGOUT — only button for now */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button fullWidth variant="outlined" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

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
        </Routes>
      </Box>

    </Box>
  );
}