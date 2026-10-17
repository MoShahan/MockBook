"use client"

import { Box, type BoxProps } from "@mui/material"

/** Shared content width - keep Navbar inner align in sync. */
export const PAGE_MAX_WIDTH = 1440
export const PAGE_MAX_WIDTH_NARROW = 720

type PageShellProps = BoxProps & {
  /** Constrain width for single-column pages (post, notifications). */
  narrow?: boolean
}

/**
 * Shared page gutters so home / profile / notifications feel like one product.
 */
const PageShell = ({ children, narrow = false, sx, ...props }: PageShellProps) => {
  return (
    <Box
      component="main"
      id="main-content"
      tabIndex={-1}
      {...props}
      sx={{
        width: "100%",
        maxWidth: narrow ? PAGE_MAX_WIDTH_NARROW : PAGE_MAX_WIDTH,
        margin: "0 auto",
        padding: { xs: "1rem 0.85rem 2rem", sm: "1.15rem 1.25rem 2.25rem", md: "1.25rem 1.75rem 2.5rem" },
        outline: "none",
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default PageShell
