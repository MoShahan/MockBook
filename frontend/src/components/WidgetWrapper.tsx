"use client"

import { alpha, Box, type BoxProps, useTheme } from "@mui/material"

/** Solid card surface (not glassy) - navbar owns the blur treatment. */
const WidgetWrapper = ({ children, sx, ...props }: BoxProps) => {
  const theme = useTheme()

  return (
    <Box
      {...props}
      sx={{
        padding: "1.15rem 1.15rem 0.85rem 1.15rem",
        backgroundColor: "background.alt",
        borderRadius: `${Number(theme.shape.borderRadius) * 1.15}px`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 1px 0 ${alpha(theme.palette.common.white, 0.04)}`
            : `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default WidgetWrapper
