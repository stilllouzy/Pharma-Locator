import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export const DRAWER_WIDTH = 248;
export const RAIL_WIDTH = 72;

// Resident role accent (from design system role-coding: resident = purple)
const ACCENT = "#6A1B9A";

interface NavLinkItem {
  label: string;
  path: string;
  icon: typeof HomeOutlinedIcon;
  end?: boolean;
}

const links: NavLinkItem[] = [
  { label: "Home", path: "/user", icon: HomeOutlinedIcon, end: true },
  { label: "Map", path: "/user/map", icon: MapOutlinedIcon },
  { label: "Orders", path: "/user/orders", icon: ReceiptLongOutlinedIcon },
  { label: "Prescriptions", path: "/user/prescription", icon: DescriptionOutlinedIcon },
  { label: "Notifications", path: "/user/notifications", icon: NotificationsNoneOutlinedIcon },
];

interface SidebarProps {
  open: boolean;
}

export default function UserSidebar({ open }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isLinkActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <Box
      component="nav"
      sx={{
        width: open ? DRAWER_WIDTH : RAIL_WIDTH,
        flexShrink: 0,
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: (theme) => theme.zIndex.drawer,
        backgroundColor: "#0D3B6E",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* BRAND */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          height: 64,
          px: open ? 2.5 : 0,
          justifyContent: open ? "flex-start" : "center",
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: ACCENT,
            flexShrink: 0,
          }}
        />
        {open && (
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
            Pharma Locator
          </Typography>
        )}
      </Box>

      <Box sx={{ borderTop: "0.5px solid rgba(255,255,255,0.12)" }} />

      {/* NAV LINKS */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: open ? 1.5 : 1,
          py: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4 },
        }}
      >
        {open && (
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 500,
              color: "rgba(255,255,255,0.32)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              px: 1.25,
              mb: 0.5,
            }}
          >
            Resident
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {links.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path, item.end);

            const navItem = (
              <NavLink key={item.path} to={item.path} end={item.end} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: open ? 1.25 : 0,
                    py: 1,
                    justifyContent: open ? "flex-start" : "center",
                    borderRadius: "8px",
                    position: "relative",
                    color: active ? "#fff" : "rgba(255,255,255,0.62)",
                    backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                    "&:hover": {
                      backgroundColor: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
                      color: "#fff",
                    },
                    transition: "background-color 0.15s, color 0.15s",
                  }}
                >
                  {active && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        bottom: "20%",
                        width: 3,
                        borderRadius: "0 3px 3px 0",
                        backgroundColor: ACCENT,
                      }}
                    />
                  )}
                  <Icon sx={{ fontSize: 19, flexShrink: 0 }} />
                  {open && (
                    <Typography sx={{ fontSize: 13.5, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                      {item.label}
                    </Typography>
                  )}
                </Box>
              </NavLink>
            );

            return open ? (
              navItem
            ) : (
              <Tooltip key={item.path} title={item.label} placement="right" arrow>
                {navItem}
              </Tooltip>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ borderTop: "0.5px solid rgba(255,255,255,0.12)" }} />

      {/* LOGOUT */}
      <Box sx={{ p: open ? 1.5 : 1, flexShrink: 0 }}>
        {open ? (
          <Box
            onClick={handleLogout}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.25,
              py: 1,
              borderRadius: "8px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.62)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" },
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
            <Typography sx={{ fontSize: 13.5 }}>Log out</Typography>
          </Box>
        ) : (
          <Tooltip title="Log out" placement="right" arrow>
            <IconButton
              onClick={handleLogout}
              sx={{ color: "rgba(255,255,255,0.62)", "&:hover": { color: "#fff" }, mx: "auto", display: "flex" }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}