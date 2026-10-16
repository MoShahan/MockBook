import { alpha, type ThemeOptions } from "@mui/material/styles"

/**
 * MockBook design tokens — stone-first UI, muted forest green as accent only (Step 5.1).
 * Typography families come from CSS variables set in `layout.tsx` (next/font).
 */
export const colorTokens = {
  stone: {
    0: "#FFFFFF",
    50: "#FAFAF9",
    100: "#F5F5F4",
    200: "#E7E5E4",
    300: "#D6D3D1",
    400: "#A8A29E",
    500: "#78716C",
    600: "#57534E",
    700: "#44403C",
    800: "#292524",
    900: "#1C1917",
    950: "#0C0A09",
  },
  /** Desaturated olive — accent for brand / primary actions, not page chrome. */
  forest: {
    50: "#F3F6F3",
    100: "#E4EBE4",
    200: "#C5D4C7",
    300: "#9BB5A0",
    400: "#6F9478",
    500: "#4F7A5A",
    600: "#3D6248",
    700: "#314F3B",
    800: "#283F30",
    900: "#1A2A20",
  },
} as const

const fontBody = 'var(--font-body), "Segoe UI", system-ui, sans-serif'
const fontDisplay = 'var(--font-display), Georgia, "Times New Roman", serif'

export const themeSettings = (mode: "light" | "dark"): ThemeOptions => {
  const isDark = mode === "dark"

  // Keep primary quieter so most UI reads as stone/ink, not green.
  const primary = isDark
    ? {
        light: colorTokens.forest[300],
        main: colorTokens.forest[400],
        dark: colorTokens.forest[200],
        contrastText: colorTokens.stone[950],
      }
    : {
        light: colorTokens.forest[100],
        main: colorTokens.forest[700],
        dark: colorTokens.forest[800],
        contrastText: colorTokens.stone[0],
      }

  const neutral = isDark
    ? {
        dark: colorTokens.stone[100],
        main: colorTokens.stone[300],
        mediumMain: colorTokens.stone[400],
        medium: colorTokens.stone[500],
        light: colorTokens.stone[800],
      }
    : {
        dark: colorTokens.stone[700],
        main: colorTokens.stone[600],
        mediumMain: colorTokens.stone[500],
        medium: colorTokens.stone[400],
        light: colorTokens.stone[100],
      }

  // Neutral charcoal/stone surfaces — not green-tinted pages.
  const background = isDark
    ? { default: colorTokens.stone[950], alt: colorTokens.stone[900] }
    : { default: colorTokens.stone[100], alt: colorTokens.stone[0] }

  const divider = isDark ? alpha(colorTokens.stone[100], 0.1) : alpha(colorTokens.stone[800], 0.1)

  return {
    palette: {
      mode,
      primary,
      secondary: {
        main: isDark ? colorTokens.stone[400] : colorTokens.stone[600],
      },
      success: {
        main: isDark ? "#6F9478" : "#3D6248",
        dark: colorTokens.forest[800],
        light: colorTokens.forest[200],
      },
      error: {
        main: isDark ? "#F87171" : "#DC2626",
        dark: isDark ? "#EF4444" : "#B91C1C",
        light: isDark ? "#FCA5A5" : "#FECACA",
      },
      neutral,
      divider,
      background,
      text: {
        primary: isDark ? colorTokens.stone[100] : colorTokens.stone[800],
        secondary: isDark ? colorTokens.stone[400] : colorTokens.stone[500],
      },
      action: {
        hover: isDark ? alpha(colorTokens.stone[100], 0.06) : alpha(colorTokens.stone[900], 0.04),
        selected: isDark ? alpha(colorTokens.forest[400], 0.12) : alpha(colorTokens.forest[700], 0.08),
        focus: isDark ? alpha(colorTokens.forest[400], 0.2) : alpha(colorTokens.forest[700], 0.16),
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    typography: {
      fontFamily: fontBody,
      fontSize: 14,
      htmlFontSize: 16,
      h1: {
        fontFamily: fontDisplay,
        fontSize: "2.5rem",
        fontWeight: 650,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
      },
      h2: {
        fontFamily: fontDisplay,
        fontSize: "2rem",
        fontWeight: 650,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
      },
      h3: {
        fontFamily: fontDisplay,
        fontSize: "1.5rem",
        fontWeight: 600,
        letterSpacing: "-0.015em",
        lineHeight: 1.25,
      },
      h4: {
        fontFamily: fontDisplay,
        fontSize: "1.25rem",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1.3,
      },
      h5: {
        fontFamily: fontBody,
        fontSize: "1.05rem",
        fontWeight: 600,
        lineHeight: 1.35,
      },
      h6: {
        fontFamily: fontBody,
        fontSize: "0.95rem",
        fontWeight: 600,
        lineHeight: 1.4,
      },
      body1: { fontSize: "0.95rem", lineHeight: 1.55 },
      body2: { fontSize: "0.875rem", lineHeight: 1.5 },
      button: {
        fontFamily: fontBody,
        fontWeight: 600,
        textTransform: "none" as const,
        letterSpacing: "0.01em",
      },
      subtitle1: { fontFamily: fontBody, fontWeight: 600 },
      caption: { fontSize: "0.75rem", lineHeight: 1.4 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Soft stone wash only — avoid green wash across the whole app.
            backgroundImage: isDark
              ? `radial-gradient(900px 480px at 8% -8%, ${alpha(colorTokens.stone[700], 0.35)}, transparent 55%)`
              : `radial-gradient(900px 480px at 8% -8%, ${alpha(colorTokens.stone[200], 0.7)}, transparent 55%)`,
            backgroundAttachment: "fixed",
          },
          "*:focus-visible": {
            outline: `2px solid ${primary.main}`,
            outlineOffset: 2,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            paddingInline: 16,
            paddingBlock: 8,
            boxShadow: "none",
            transition: "background-color 0.15s ease, color 0.15s ease, transform 0.12s ease",
            "&:hover": { boxShadow: "none" },
            "&:active": { transform: "scale(0.98)" },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            transition: "background-color 0.15s ease, color 0.15s ease, transform 0.12s ease",
            "&:hover": {
              backgroundColor: isDark
                ? alpha(colorTokens.stone[0], 0.08)
                : alpha(colorTokens.stone[900], 0.06),
            },
            "&:active": { transform: "scale(0.94)" },
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            marginInline: 4,
            transition: "background-color 0.12s ease",
            "&:hover": {
              backgroundColor: isDark
                ? alpha(colorTokens.stone[0], 0.08)
                : alpha(colorTokens.stone[900], 0.06),
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            transition: "color 0.15s ease",
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isDark ? alpha(colorTokens.stone[0], 0.03) : colorTokens.stone[0],
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            "&.Mui-focused": {
              boxShadow: `0 0 0 3px ${alpha(primary.main, isDark ? 0.28 : 0.18)}`,
            },
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 12,
            border: `1px solid ${divider}`,
            boxShadow: isDark
              ? `0 12px 40px ${alpha("#000", 0.45)}`
              : `0 12px 32px ${alpha(colorTokens.stone[900], 0.12)}`,
          },
          list: {
            paddingBlock: 4,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: "0.75rem",
          },
        },
      },
    },
  }
}
