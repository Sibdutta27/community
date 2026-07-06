import { createTheme } from "@mui/material/styles";

/**
 * Azul-flag admin theme — the brand palette (deep azul + celeste + flag-red)
 * applied to the internal dashboard. Deep-azul chrome (sidebar/navbar/login)
 * lives in CSS Modules via the `--admin-*` tokens in `styles/style.css`; this
 * MUI theme drives the light content area and every default MUI component
 * (buttons, inputs, dialogs, the enrollment Stepper, chips, etc.).
 */

const AZUL = "#0a56a8";
const CELESTE = "#4ea6dc";
const FLAG_RED = "#c42032";
const INK = "#141a22";
const MUTED = "#5a6472";

const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: AZUL,
      light: "#1d6fb8",
      dark: "#08447f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: CELESTE,
      light: "#7dc0e7",
      dark: "#2f7fb5",
      contrastText: "#0b2033",
    },
    error: { main: FLAG_RED, contrastText: "#ffffff" },
    success: { main: "#1f9d57", contrastText: "#ffffff" },
    warning: { main: "#f59e0b", contrastText: "#141a22" },
    info: { main: AZUL, contrastText: "#ffffff" },
    background: { default: "#f6f8fa", paper: "#ffffff" },
    text: { primary: INK, secondary: MUTED },
    divider: "#e2e6eb",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: AZUL,
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "#cbd5e1",
          "&.Mui-active": { color: AZUL },
          "&.Mui-completed": { color: "#1f9d57" },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
});

export default adminTheme;
