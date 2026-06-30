import { Box, Typography, IconButton, Tooltip, Drawer, useMediaQuery, type Theme } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Seal.png";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export const DRAWER_WIDTH = 248;
export const RAIL_WIDTH = 72;
export const MOBILE_DRAWER_WIDTH = 260;

// Rider role accent (from design system role-coding: rider = orange)
const ACCENT = "#E65100";

interface NavLinkItem {
  label: string;
  path: string;
  icon: typeof DashboardOutlinedIcon;
  end?: boolean;
}

const links: NavLinkItem[] = [
  { label: "Dashboard", path: "/rider", icon: DashboardOutlinedIcon, end: true },
  { label: "My deliveries", path: "/rider/deliveries", icon: LocalShippingOutlinedIcon },
  { label: "Delivery history", path: "/rider/history", icon: HistoryOutlinedIcon },
  { label: "Delivery map", path: "/rider/map", icon: MapOutlinedIcon },
  { label: "Profile", path: "/rider/profile", icon: PersonOutlineOutlinedIcon },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
}

export default function RiderSidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const isLinkActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const showLabels = isMobile || open;

  const content = (
    <Box
      sx={{
        height: "100%",
        backgroundColor: "#0D3B6E",
        display: "flex",
        flexDirection: "column",
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
      width: open ? 38 : 34,
      height: open ? 38 : 34,
      borderRadius: "50%",
      backgroundColor: "white",
      border: "1px solid rgba(255,255,255,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      transition: "width 0.25s ease, height 0.25s ease",
    }}
  >
    <img
      src={logo}
      alt="Pharma Locator"
      style={{
        height: showLabels ? 28 : 24,
        width: showLabels ? 28 : 24,
        objectFit: "contain",
        flexShrink: 0,
        transition: "height 0.25s ease, width 0.25s ease",
        mixBlendMode: "multiply",
      }}
    />
  </Box>
  {showLabels && (
    <Box>
      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", lineHeight: 1.2 }}>
        Brgy. Emmanuel Bergado 1
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
        Pharma Locator
      </Typography>
    </Box>
  )}
</Box>
      <Box sx={{ borderTop: "0.5px solid rgba(255,255,255,0.12)" }} />

      {/* NAV LINKS */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: showLabels ? 1.5 : 1,
          py: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 4 },
        }}
      >
        {showLabels && (
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
            Rider
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {links.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.path, item.end);

            const navItem = (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={{ textDecoration: "none" }}
                onClick={isMobile ? onClose : undefined}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    px: showLabels ? 1.25 : 0,
                    py: 1,
                    justifyContent: showLabels ? "flex-start" : "center",
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
                  {showLabels && (
                    <Typography sx={{ fontSize: 13.5, fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                      {item.label}
                    </Typography>
                  )}
                </Box>
              </NavLink>
            );

            return showLabels ? (
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
      <Box sx={{ p: showLabels ? 1.5 : 1, flexShrink: 0 }}>
        {showLabels ? (
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

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: MOBILE_DRAWER_WIDTH,
            boxSizing: "border-box",
            border: "none",
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

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
        transition: "width 0.25s ease",
      }}
    >
      {content}
    </Box>
  );
}