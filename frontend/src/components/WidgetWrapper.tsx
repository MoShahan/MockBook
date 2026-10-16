"use client"

import { Box, type BoxProps, useTheme } from "@mui/material"

import { cardShadow } from "@/theme"

/** Solid card surface (not glassy) - navbar owns the blur treatment. */
const WidgetWrapper = ({ children, sx, ...props }: BoxProps) => {
  const theme = useTheme()

  return (
    <Box
      {...props}
      sx={{
        padding: "1.15rem 1.15rem 0.9rem 1.15rem",
        backgroundColor: "background.alt",
        borderRadius: `${Number(theme.shape.borderRadius) * 1.15}px`,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: cardShadow(theme.palette.mode),
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default WidgetWrapper
