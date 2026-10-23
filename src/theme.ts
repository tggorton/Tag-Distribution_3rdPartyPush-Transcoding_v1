import { createTheme } from "@mui/material/styles";

const PINK = "#EF0078";
const PINK_HOVER = "#D82388";
const NAV_BLUE = "#001529";
const PAPER = "#383838";
const SUNKEN = "#1a1a1a";
const BORDER = "#5D5D5D";

const SYSTEM_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * Monospace stack for tag strings, param outputs, and base URLs — anywhere the
 * user reads raw tag syntax. Import this rather than re-typing a stack inline.
 */
export const MONO_FONT_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';

/**
 * `background.sunken` is a recessed surface that reads as *below* the paper
 * surface — used for read-only code/preview panels (see TagPreview).
 */
declare module "@mui/material/styles" {
  interface TypeBackground {
    sunken: string;
  }
}

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: PINK, dark: PINK_HOVER, contrastText: "#ffffff" },
    secondary: { main: NAV_BLUE },
    background: { default: "#000000", paper: PAPER, sunken: SUNKEN },
    text: {
      primary: "#ffffff",
      secondary: "#cdcdcd",
      disabled: "rgba(255,255,255,0.38)",
    },
    divider: BORDER,
    action: {
      hover: "#1e1e1e",
      selected: "rgba(239,0,120,0.12)",
    },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: SYSTEM_FONT_STACK,
    h4: { fontWeight: 400, letterSpacing: 0 },
    h5: { fontWeight: 400, letterSpacing: 0 },
    h6: { fontWeight: 500, letterSpacing: "0.0075em" },
    overline: { letterSpacing: "0.08em" },
    button: { fontWeight: 600, letterSpacing: "0.04em" },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 600,
          borderRadius: 4,
          whiteSpace: "nowrap",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiCheckbox: { defaultProps: { color: "primary" } },
    MuiRadio: { defaultProps: { color: "primary" } },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: { borderColor: "rgba(255,255,255,0.23)" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: PINK, height: 3 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          fontWeight: 600,
          minWidth: 80,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          borderColor: BORDER,
        },
        head: {
          color: "#cdcdcd",
          fontWeight: 500,
          backgroundColor: "transparent",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: BORDER },
      },
    },
  },
});
