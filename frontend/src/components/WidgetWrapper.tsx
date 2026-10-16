"use client"

import { Box, type BoxProps, useTheme } from "@mui/material"

/** Solid card surface (not glassy) — navbar owns the blur treatment. */
const WidgetWrapper = ({ children, sx, ...props }: BoxProps) => {
  const theme = useTheme()

  return (
    <Box
      {...props}
      sx={{
        padding: "1.5rem 1.5rem 0.75rem 1.5rem",
        backgroundColor: "background.alt",
        borderRadius: `${Number(theme.shape.borderRadius) * 1.25}px`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 1px 0 rgba(255,255,255,0.04)"
            : "0 1px 2px rgba(28, 25, 23, 0.04)",
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default WidgetWrapper
