import { createTheme } from "@mui/material/styles";

// Pharma Locator design system — see pharma_locator_design_system.html
const theme = createTheme({
  palette: {
    primary: {
      main: "#0D3B6E", // navy — chrome, primary actions
    },
    secondary: {
      main: "#5BC4A0", // teal — accent, health/action signature
    },
    background: {
      default: "#F4F7FB", // cool surface
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

export default theme;
