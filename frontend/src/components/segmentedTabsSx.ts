import { alpha, type SxProps, type Theme } from "@mui/material"

/** Pill segmented control look for MUI Tabs (home feed, profile sections). */
export const segmentedTabsSx: SxProps<Theme> = {
  minHeight: 40,
  mb: "0.85rem",
  p: 0.4,
  width: "fit-content",
  maxWidth: "100%",
  borderRadius: 2.5,
  bgcolor: theme =>
    theme.palette.mode === "dark"
      ? alpha(theme.palette.common.white, 0.06)
      : alpha(theme.palette.common.black, 0.04),
  border: theme => `1px solid ${theme.palette.divider}`,
  "& .MuiTabs-indicator": {
    height: "100%",
    borderRadius: 2,
    bgcolor: theme =>
      theme.palette.mode === "dark"
        ? alpha(theme.palette.primary.main, 0.22)
        : alpha(theme.palette.primary.main, 0.14),
    border: theme =>
      `1px solid ${
        theme.palette.mode === "dark"
          ? alpha(theme.palette.primary.main, 0.35)
          : alpha(theme.palette.primary.main, 0.22)
      }`,
    boxShadow: "none",
    zIndex: 0,
  },
  "& .MuiTab-root": {
    zIndex: 1,
    minHeight: 32,
    minWidth: 0,
    px: 1.5,
    py: 0.45,
    borderRadius: 2,
    color: "text.secondary",
    gap: 0.5,
    display: "inline-flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    "&.Mui-selected": {
      color: "primary.main",
    },
  },
  "& .MuiTab-iconWrapper": {
    margin: "0 !important",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
  },
  "& .MuiTab-iconWrapper .MuiSvgIcon-root": {
    fontSize: "15px",
    width: "15px",
    height: "15px",
  },
}
