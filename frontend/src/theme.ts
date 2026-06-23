import { createTheme, alpha } from "@mui/material/styles";

const NAVY      = "#0D3B6E";
const NAVY_LIGHT = "#1565C0";
const NAVY_DARK  = "#082952";
const TEAL       = "#5BC4A0";
const TEAL_DARK  = "#3A9E7E";
const SURFACE    = "#F4F7FB";

const SUCCESS    = "#2E7D32";
const SUCCESS_BG = "#E8F5E9";
const WARNING    = "#F57F17";
const WARNING_BG = "#FFF8E1";
const ERROR      = "#C62828";
const ERROR_BG   = "#FFEBEE";
const INFO       = "#1565C0";
const INFO_BG    = "#E3F2FD";

// Shared card content padding — used everywhere
export const CARD_PADDING = { px: "20px", py: "18px" };

const theme = createTheme({
  palette: {
    primary:    { main: NAVY, light: NAVY_LIGHT, dark: NAVY_DARK, contrastText: "#fff" },
    secondary:  { main: TEAL, dark: TEAL_DARK, contrastText: "#fff" },
    background: { default: SURFACE, paper: "#fff" },
    text:       { primary: "#0D1B2A", secondary: "#546E7A", disabled: "#90A4AE" },
    success:    { main: SUCCESS, light: SUCCESS_BG, contrastText: SUCCESS },
    warning:    { main: WARNING, light: WARNING_BG, contrastText: WARNING },
    error:      { main: ERROR,   light: ERROR_BG,   contrastText: ERROR   },
    info:       { main: INFO,    light: INFO_BG,    contrastText: INFO    },
    divider:    "rgba(0,0,0,0.07)",
  },

  shape: { borderRadius: 10 },

  typography: {
    // Plus Jakarta Sans — modern, slightly geometric, still professional
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    fontWeightLight:   300,
    fontWeightRegular: 400,
    fontWeightMedium:  500,
    fontWeightBold:    600,
    h1: { fontSize: "2rem",   fontWeight: 700, color: NAVY, lineHeight: 1.2 },
    h2: { fontSize: "1.5rem", fontWeight: 700, color: NAVY, lineHeight: 1.3 },
    h3: { fontSize: "1.25rem",fontWeight: 600, color: NAVY },
    h4: { fontSize: "1.1rem", fontWeight: 600, color: NAVY },
    h5: { fontSize: "1rem",   fontWeight: 600 },
    h6: { fontSize: "0.9rem", fontWeight: 600 },
    subtitle1: { fontSize: "0.95rem", fontWeight: 400, color: "#546E7A" },
    subtitle2: { fontSize: "0.85rem", fontWeight: 500, color: "#546E7A" },
    body1:     { fontSize: "0.875rem", lineHeight: 1.7 },
    body2:     { fontSize: "0.8rem",   lineHeight: 1.6, color: "#546E7A" },
    caption:   { fontSize: "0.72rem",  color: "#90A4AE", letterSpacing: "0.02em" },
    overline:  { fontSize: "0.68rem",  fontWeight: 600,  letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#90A4AE" },
    button:    { fontWeight: 600, textTransform: "none" as const, letterSpacing: "0.01em" },
  },

  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          color: "#0D1B2A",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: NAVY,
          color: "#fff",
          borderRight: "none",
          boxShadow: "4px 0 24px rgba(13,59,110,0.15)",
        },
      },
    },

    // ── Card: uniform padding everywhere ──────────────────────────────────
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: "0.5px solid rgba(0,0,0,0.08)",
          borderRadius: 12,
          backgroundColor: "#fff",
          transition: "box-shadow 0.2s ease",
          "&:hover": { boxShadow: "0 4px 20px rgba(13,59,110,0.08)" },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          // Single source of truth — 20px horizontal, 18px vertical
          padding: "18px 20px",
          "&:last-child": { paddingBottom: 18 },
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root:     { backgroundImage: "none" },
        rounded:  { borderRadius: 12 },
        outlined: { border: "0.5px solid rgba(0,0,0,0.08)" },
      },
    },

    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: "0.82rem",
          "&.MuiButton-containedPrimary":   { backgroundColor: NAVY, "&:hover": { backgroundColor: NAVY_DARK } },
          "&.MuiButton-containedSecondary": { backgroundColor: TEAL, color: "#fff", "&:hover": { backgroundColor: TEAL_DARK } },
          "&.MuiButton-outlinedPrimary":    { borderColor: NAVY, color: NAVY, "&:hover": { backgroundColor: alpha(NAVY, 0.05) } },
        },
        outlined: { borderWidth: "0.5px", "&:hover": { borderWidth: "0.5px" } },
        text:     { "&:hover": { backgroundColor: alpha(NAVY, 0.05) } },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 8, "&:hover": { backgroundColor: alpha(NAVY, 0.06) } },
      },
    },

    MuiTextField: {
      defaultProps: { size: "small", variant: "outlined" },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#fff",
          fontSize: "0.875rem",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.15)", borderWidth: "0.5px" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: NAVY_LIGHT, borderWidth: "1px" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: NAVY, borderWidth: "1.5px" },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: "0.85rem", color: "#546E7A", "&.Mui-focused": { color: NAVY } },
      },
    },

    MuiChip: {
      styleOverrides: {
        root:          { borderRadius: 20, fontWeight: 600, fontSize: "0.7rem", height: 24 },
        colorSuccess:  { backgroundColor: SUCCESS_BG, color: SUCCESS },
        colorWarning:  { backgroundColor: WARNING_BG, color: WARNING },
        colorError:    { backgroundColor: ERROR_BG,   color: ERROR   },
        colorInfo:     { backgroundColor: INFO_BG,    color: INFO    },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE,
          "& .MuiTableCell-head": {
            fontWeight: 700,
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "#546E7A",
            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "0.5px solid rgba(0,0,0,0.06)", fontSize: "0.85rem", padding: "12px 16px" },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: alpha(NAVY, 0.03) },
          "&:last-child td": { borderBottom: "none" },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "1px 8px",
          padding: "8px 12px",
          color: "rgba(255,255,255,0.6)",
          transition: "background 0.15s ease, color 0.15s ease",
          "&:hover":        { backgroundColor: "rgba(255,255,255,0.08)", color: "#fff" },
          "&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.12)", color: "#fff",
            "&:hover":      { backgroundColor: "rgba(255,255,255,0.16)" } },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: { root: { minWidth: 36, color: "inherit" } },
    },

    MuiListItemText: {
      styleOverrides: { primary: { fontSize: "0.85rem", fontWeight: 500 } },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: "rgba(0,0,0,0.07)" } },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: "#0D1B2A", fontSize: "0.72rem", borderRadius: 6, padding: "5px 10px" },
        arrow:   { color: "#0D1B2A" },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontSize: "0.82rem",
          alignItems: "center",
          "&.MuiAlert-standardSuccess": { backgroundColor: SUCCESS_BG, color: SUCCESS },
          "&.MuiAlert-standardWarning": { backgroundColor: WARNING_BG, color: WARNING },
          "&.MuiAlert-standardError":   { backgroundColor: ERROR_BG,   color: ERROR   },
          "&.MuiAlert-standardInfo":    { backgroundColor: INFO_BG,    color: INFO    },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 14, boxShadow: "0 20px 60px rgba(13,59,110,0.15)" },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1rem", fontWeight: 700, color: NAVY, padding: "20px 24px 12px" },
      },
    },

    MuiDialogContent: {
      styleOverrides: { root: { padding: "8px 24px 20px" } },
    },

    MuiDialogActions: {
      styleOverrides: { root: { padding: "12px 24px 20px", gap: 8 } },
    },

    MuiTabs: {
      styleOverrides: {
        root:      { borderBottom: "0.5px solid rgba(0,0,0,0.08)" },
        indicator: { backgroundColor: NAVY, height: 2, borderRadius: "2px 2px 0 0" },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: "0.8rem",
          fontWeight: 500,
          textTransform: "none",
          color: "#546E7A",
          minHeight: 44,
          "&.Mui-selected": { color: NAVY, fontWeight: 700 },
        },
      },
    },

    MuiBadge: {
      styleOverrides: {
        badge:        { fontSize: "0.62rem", fontWeight: 700, minWidth: 18, height: 18, padding: "0 4px" },
        colorPrimary: { backgroundColor: TEAL, color: "#fff" },
        colorError:   { backgroundColor: ERROR },
      },
    },

    MuiSkeleton: {
      styleOverrides: { root: { backgroundColor: alpha(NAVY, 0.07), borderRadius: 6 } },
    },

    MuiSelect: { defaultProps: { size: "small" } },

    MuiBreadcrumbs: {
      styleOverrides: {
        root:      { fontSize: "0.8rem", color: "#90A4AE" },
        separator: { color: "#B0BEC5" },
      },
    },

    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.82rem",
          fontWeight: 500,
          "&.Mui-active":    { color: NAVY,     fontWeight: 700 },
          "&.Mui-completed": { color: TEAL_DARK },
        },
      },
    },

    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "rgba(0,0,0,0.15)",
          "&.Mui-active":    { color: NAVY },
          "&.Mui-completed": { color: TEAL },
        },
      },
    },

    MuiSnackbarContent: {
      styleOverrides: {
        root: { backgroundColor: "#0D1B2A", borderRadius: 10, fontSize: "0.85rem" },
      },
    },
  },
});

export default theme;