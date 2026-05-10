import { Box, Typography, Button, IconButton } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const pharmacyLinks = [
  { label: "Medicines", path: "/pharmacy/medicines" },
  { label: "Orders", path: "/pharmacy/orders" },
  { label: "Prescriptions", path: "/pharmacy/prescriptions" },
];

export default function PharmacyLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

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
              width: open ? 260 : 60,
              minWidth: open ? 260 : 60,
              backgroundColor: "white",
              borderRight: "1px solid #e5e7eb",
              p: 2,
              position: "sticky",   
              top: 0,
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all 0.3s ease",
            }}
          >
         {/* TOGGLE BUTTON + BRAND */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 1 }}>
                <IconButton onClick={() => setOpen(!open)} size="small">
                  {open ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                {open && (
                  <Typography sx={{ fontWeight: "bold" }}>
                    Pharmacy Panel
                  </Typography>
                )}
              </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {pharmacyLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                textDecoration: "none",
                color: isActive ? "#2563eb" : "#374151",
                background: isActive ? "#e5e7eb" : "transparent",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </Box>

       {/* LOGOUT — pushed to bottom */}
            <Box sx={{ mt: "auto", pt: 2 }}>
              {open ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <IconButton color="error" onClick={handleLogout}>
                  🚪
                </IconButton>
              )}
            </Box>
          </Box>

    </Box>
  );
}