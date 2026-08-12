import { createTheme } from "@mui/material/styles";

/**
 * Azul-flag admin theme — a dense records-system aesthetic.
 *
 * This is the back office of a tribal enrollment registry: staff read
 * applications, verify documents and decide on real people's citizenship. The
 * chrome is therefore deliberately quiet — hairline borders, near-flat
 * surfaces, small radii, tight type — so the DATA carries the page rather than
 * the container it sits in.
 *
 * Density lives HERE, not at the call sites. Control heights, card padding,
 * input sizing and table rhythm are all set once as component defaults; a page
 * that wants the standard density should write no `sx` at all.
 *
 * Chrome (sidebar/navbar/login) is styled in CSS Modules via the `--admin-*`
 * tokens in styles/style.css — keep the two in step.
 */

const AZUL = "#0a56a8";
const AZUL_LIGHT = "#1d6fb8";
const CELESTE = "#4ea6dc";
const INK = "#141a22";
const MUTED = "#5a6472";
const BORDER = "#e2e6eb";
const SURFACE_MUTED = "#eef2f6";

// Near-flat, ink-tinted elevation. A records system should not look like it is
// floating; the border does the work and the shadow only separates layers.
const SHADOW_CARD =
  "0 1px 2px rgba(20,26,34,0.06), 0 8px 20px -16px rgba(20,26,34,0.25)";
const SHADOW_CARD_SOFT = "0 1px 2px rgba(20,26,34,0.05)";
const SHADOW_DROPDOWN = "0 8px 24px -12px rgba(20,26,34,0.28)";

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
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    // Base body text is a notch below MUI's 16px. At a desk, reading a table,
    // 14px is the comfortable size and it buys back a row of height everywhere.
    fontSize: 14,

    button: { textTransform: "none", fontWeight: 600, fontSize: "0.82rem" },

    // A back office needs two or three heading sizes, not six escalating ones.
    // Anything above h4 would only ever be used to shout.
    h1: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.4rem" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.25rem" },
    h3: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.15rem" },
    h4: { fontWeight: 700, letterSpacing: "-0.02em", fontSize: "1.05rem" },
    h5: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: "0.95rem" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em", fontSize: "0.88rem" },

    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.82rem" },
    caption: { fontSize: "0.75rem" },
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
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
          boxShadow: SHADOW_CARD_SOFT,
        },
        // Popover/menu surfaces get a lighter, tighter treatment.
        elevation8: { boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { borderRadius: 8, boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: "0.85rem", minHeight: 34, paddingBlock: 4 },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: { borderRadius: 8, boxShadow: SHADOW_DROPDOWN },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 10, boxShadow: SHADOW_CARD },
      },
    },
    MuiButton: {
      // Small is the house size. A back office is mostly secondary actions;
      // anything that wants to be bigger has to ask.
      defaultProps: { disableElevation: true, size: "small" },
      styleOverrides: {
        root: {
          // Square-ish, not pills. Pills read as consumer product; a registrar's
          // tool should read as a form control.
          borderRadius: 6,
          fontWeight: 600,
          // No lift, no glow — motion and shadow on every button is the single
          // biggest source of "this feels like a marketing site".
          transition: "color 150ms, background-color 150ms, border-color 150ms",
          "&:focus-visible": { outline: `2px solid ${AZUL}`, outlineOffset: 2 },
          "@media (prefers-reduced-motion: reduce)": { transition: "none" },
        },
        containedPrimary: {
          "&:hover": { backgroundColor: "#094a92" },
        },
        containedError: {
          "&:hover": { backgroundColor: "#9c211a" },
        },
        outlined: {
          borderColor: BORDER,
          color: INK,
          backgroundColor: "#ffffff",
          "&:hover": { backgroundColor: SURFACE_MUTED, borderColor: "#cfd6de" },
        },
        sizeSmall: { height: 30, paddingInline: 10, fontSize: "0.8rem" },
        sizeMedium: { height: 34, paddingInline: 14 },
        sizeLarge: { height: 38, paddingInline: 18 },
      },
    },
    MuiIconButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&:focus-visible": { outline: `2px solid ${AZUL}`, outlineOffset: 2 },
        },
      },
    },
    // Inputs default to the dense size everywhere, so forms stop being a
    // column of 56px-tall controls.
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiAutocomplete: { defaultProps: { size: "small" } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: "0.85rem" } } },
    MuiFormHelperText: {
      styleOverrides: { root: { fontSize: "0.72rem", marginTop: 2 } },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: "0.85rem",
          backgroundColor: "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#cfd6de",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: AZUL,
            borderWidth: 1,
          },
          // A 1px ring, not a coloured cloud.
          "&.Mui-focused": { boxShadow: `0 0 0 2px rgba(10,86,168,0.15)` },
        },
        inputSizeSmall: { paddingBlock: 7.5 },
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 5 },
        sizeSmall: { height: 20, fontSize: "0.7rem" },
        labelSmall: { paddingInline: 6 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 6, paddingBlock: 2, fontSize: "0.82rem" },
        icon: { paddingBlock: 6 },
      },
    },
    MuiSkeleton: { styleOverrides: { root: { borderRadius: 4 } } },
    MuiAvatar: {
      styleOverrides: { root: { width: 28, height: 28, fontSize: "0.75rem" } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { fontSize: "0.72rem" } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiListItemText: {
      styleOverrides: { primary: { fontSize: "0.85rem", fontWeight: 500 } },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 36 },
        indicator: { backgroundColor: AZUL, height: 2, borderRadius: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.82rem",
          minHeight: 36,
          padding: "6px 12px",
          "&.Mui-selected": { color: AZUL },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          color: "#cbd5e1",
          "&.Mui-active": { color: AZUL },
          "&.Mui-completed": { color: "#1f9d57" },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: { fontSize: "0.82rem", "&.Mui-active": { fontWeight: 700 } },
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
