"use client"

import { Box, type BoxProps } from "@mui/material"

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
      {...props}
      sx={{
        width: "100%",
        maxWidth: narrow ? 720 : 1280,
        margin: "0 auto",
        padding: { xs: "1.25rem 1rem 2.5rem", sm: "1.75rem 5% 3rem", md: "2rem 6% 3rem" },
        ...((sx as object) || {}),
      }}
    >
      {children}
    </Box>
  )
}

export default PageShell
