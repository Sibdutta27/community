import { createTheme } from "@mui/material/styles";

/**
 * Azul-flag admin theme — premium light "governance" aesthetic mirrored from
 * the member app (apps/web): cool light surfaces, elevated white cards with
 * soft layered ink shadows, pill azul buttons, azul focus rings, Inter with
 * tight-tracked headings. Chrome (sidebar/navbar/login) is light glass, styled
 * in CSS Modules via the `--admin-*` tokens in styles/style.css.
 */

const AZUL = "#0a56a8";
const AZUL_LIGHT = "#1d6fb8";
const CELESTE = "#4ea6dc";
const INK = "#141a22";
const MUTED = "#5a6472";
const BORDER = "#e2e6eb";
const SURFACE_MUTED = "#eef2f6";

// Soft, layered, ink-tinted shadows (never pure black) — short negative spread.
const SHADOW_CARD =
  "0 28px 56px -40px rgba(20,26,34,0.35), 0 10px 24px -20px rgba(20,26,34,0.25)";
const SHADOW_CARD_SOFT =
  "0 18px 36px -28px rgba(20,26,34,0.22), 0 6px 16px -14px rgba(20,26,34,0.16)";
const SHADOW_DROPDOWN = "0 16px 32px -20px rgba(20,26,34,0.3)";

const adminTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: AZUL,
      light: AZUL_LIGHT,
      dark: "#08447f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: CELESTE,
      light: "#7dc0e7",
      dark: "#2f7fb5",
      contrastText: "#0b2033",
    },
    error: { main: "#b3261e", contrastText: "#ffffff" }, // reject / destructive
    success: { main: "#1f9d57", contrastText: "#ffffff" }, // approve
    warning: { main: "#f59e0b", contrastText: "#141a22" },
    info: { main: CELESTE, contrastText: "#0b2033" },
    background: { default: "#f6f8fa", paper: "#ffffff" },
    text: { primary: INK, secondary: MUTED },
    divider: BORDER,
    action: {
      active: AZUL,
      hover: SURFACE_MUTED,
      selected: "rgba(10,86,168,0.08)",
      focus: "rgba(10,86,168,0.25)",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
    h1: { fontWeight: 700, letterSpacing: "-0.03em" },
    h2: { fontWeight: 700, letterSpacing: "-0.03em" },
    h3: { fontWeight: 700, letterSpacing: "-0.025em" },
    h4: { fontWeight: 700, letterSpacing: "-0.025em" },
    h5: { fontWeight: 600, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.02em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f6f8fa",
          color: INK,
          WebkitFontSmoothing: "antialiased",
          textRendering: "optimizeLegibility",
        },
        "::selection": { backgroundColor: AZUL, color: "#ffffff" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: "none",
          borderRadius: 16,
          border: `1px solid ${BORDER}`,
          boxShadow: SHADOW_CARD_SOFT,
        },
        // Popover/menu surfaces get a lighter, tighter treatment.
        elevation8: { boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { borderRadius: 12, boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: SHADOW_CARD },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          transition:
            "color 200ms, background-color 200ms, border-color 200ms, box-shadow 200ms, transform 200ms",
          "&:hover": { transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(1px)" },
          "&:focus-visible": { outline: `2px solid ${AZUL}`, outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:hover": { transform: "none" },
            "&:active": { transform: "none" },
          },
        },
        containedPrimary: {
          boxShadow: "0 12px 24px -18px rgba(10,86,168,0.45)",
          "&:hover": {
            boxShadow: "0 16px 30px -18px rgba(10,86,168,0.55)",
            filter: "brightness(0.97)",
            transform: "translateY(-1px)",
          },
        },
        containedError: {
          boxShadow: "0 12px 24px -18px rgba(179,38,30,0.45)",
          "&:hover": {
            boxShadow: "0 16px 30px -18px rgba(179,38,30,0.55)",
            filter: "brightness(0.97)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: BORDER,
          color: INK,
          backgroundColor: "#ffffff",
          "&:hover": { backgroundColor: SURFACE_MUTED, borderColor: BORDER },
        },
        sizeSmall: { height: 40, paddingInline: 16 },
        sizeMedium: { height: 44, paddingInline: 20 },
        sizeLarge: { height: 48, paddingInline: 24 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&:focus-visible": { outline: `2px solid ${AZUL}`, outlineOffset: 2 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#cfd6de" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: AZUL,
            borderWidth: 1,
          },
          "&.Mui-focused": {
            boxShadow: "0 6px 16px -10px rgba(10,86,168,0.4)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: AZUL, height: 3, borderRadius: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          "&.Mui-selected": { color: AZUL },
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
    MuiDivider: {
      styleOverrides: { root: { borderColor: BORDER } },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: AZUL,
          textDecorationColor: "rgba(10,86,168,0.4)",
          "&:focus-visible": { outline: `2px solid ${AZUL}`, outlineOffset: 2 },
        },
      },
    },
  },
});

export default adminTheme;
