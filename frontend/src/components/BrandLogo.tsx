"use client"

import React from "react"
import { Box, Typography, useTheme } from "@mui/material"

type BrandLogoProps = {
  /** Click handler (e.g. go home). */
  onClick?: () => void
  /** Compact for navbar vs larger for auth pages. */
  size?: "nav" | "auth"
}

const BrandLogo = ({ onClick, size = "nav" }: BrandLogoProps) => {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const pLight = theme.palette.primary.light
  const isNav = size === "nav"
  const markPx = isNav ? 32 : 44

  return (
    <Box
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label="MockBook home"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: isNav ? "0.65rem" : "0.85rem",
        border: 0,
        background: "none",
        padding: 0,
        margin: 0,
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
        "&:hover .mockbook-wordmark": onClick
          ? { color: theme.palette.mode === "dark" ? pLight : theme.palette.primary.dark }
          : undefined,
        "&:hover .mockbook-mark": onClick ? { transform: "scale(1.04)" } : undefined,
      }}
    >
      <Box
        className="mockbook-mark"
        component="img"
        src="/mockbook-mark.png"
        alt=""
        width={markPx}
        height={markPx}
        sx={{
          width: markPx,
          height: markPx,
          borderRadius: "0.65rem",
          display: "block",
          flexShrink: 0,
          transition: "transform 0.15s ease",
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 0 0 1px rgba(255,255,255,0.08)"
              : "0 1px 2px rgba(0,0,0,0.08)",
        }}
      />
      <Typography
        className="mockbook-wordmark"
        component="span"
        sx={{
          fontFamily: "var(--font-display), Georgia, serif",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontSize: isNav ? "clamp(1.05rem, 1.8vw, 1.35rem)" : "clamp(1.35rem, 2.5vw, 1.75rem)",
          color: primary,
          transition: "color 0.15s ease",
          userSelect: "none",
        }}
      >
        MockBook
      </Typography>
    </Box>
  )
}

export default BrandLogo
