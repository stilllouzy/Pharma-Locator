import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/Seal.png";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

export const DRAWER_WIDTH = 248;
export const RAIL_WIDTH = 72;

interface NavLinkItem {
  label: string;
  path: string;
  icon: typeof DashboardOutlinedIcon;
  end?: boolean;
}

interface NavSection {
  title: string;
  links: NavLinkItem[];
}

const sections: NavSection[] = [
  {
    title: "Overview",
    links: [{ label: "Dashboard", path: "/admin", icon: DashboardOutlinedIcon, end: true }],
  },
  {
    title: "Management",
    links: [
      { label: "Users", path: "/admin/users", icon: PeopleAltOutlinedIcon },
      { label: "Pharmacies", path: "/admin/pharmacies", icon: StorefrontOutlinedIcon },
      { label: "Medicines", path: "/admin/medicines", icon: MedicationOutlinedIcon },
      { label: "Orders", path: "/admin/orders", icon: LocalShippingOutlinedIcon },
    ],
  },
  {
    title: "System",
    links: [
      { label: "Notifications", path: "/admin/notifications", icon: NotificationsNoneOutlinedIcon },
      { label: "Reports", path: "/admin/reports", icon: BarChartOutlinedIcon },
      { label: "Settings", path: "/admin/settings", icon: SettingsOutlinedIcon },
    ],
  },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
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
  <img
    src={logo}
    alt="Pharma Locator"
    style={{
      height: open ? 36 : 32,
      width: open ? "auto" : 32,
      objectFit: "contain",
      flexShrink: 0,
      transition: "height 0.25s ease, width 0.25s ease",
    }}
  />
  {open && (
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

      {/* NAV SECTIONS */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          px: open ? 1.5 : 1,
          py: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 4,
          },
        }}
      >
        {sections.map((section) => (
          <Box key={section.title} sx={{ mb: 1.5 }}>
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
                {section.title}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {section.links.map((item) => {
                const Icon = item.icon;
                const active = isLinkActive(item.path, item.end);

                const navItem = (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    style={{ textDecoration: "none" }}
                  >
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
                          backgroundColor: active
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.06)",
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
                            backgroundColor: "#5BC4A0",
                          }}
                        />
                      )}
                      <Icon sx={{ fontSize: 19, flexShrink: 0 }} />
                      {open && (
                        <Typography
                          sx={{
                            fontSize: 13.5,
                            fontWeight: active ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
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
        ))}
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