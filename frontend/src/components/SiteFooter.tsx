"use client"

import { Box, Link as MuiLink, Typography, useTheme } from "@mui/material"
import NextLink from "next/link"

import { PAGE_MAX_WIDTH } from "@/components/PageShell"

const LINKS = [
  { href: "/help", label: "Help" },
  { href: "/help#contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const

type SiteFooterProps = {
  /** Compact footer under auth forms. */
  compact?: boolean
}

/**
 * Shared footer links for Help / Privacy / Terms / Contact.
 */
const SiteFooter = ({ compact = false }: SiteFooterProps) => {
  const theme = useTheme()

  return (
    <Box
      component="footer"
      sx={{
        mt: compact ? 2.5 : 4,
        pt: compact ? 2 : 3,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: compact ? "100%" : PAGE_MAX_WIDTH,
          margin: "0 auto",
          px: compact ? 0 : { xs: 2, sm: 3, md: 4 },
          pb: compact ? 0 : 3,
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1.5, sm: 2.5 },
          justifyContent: compact ? "center" : "flex-start",
          alignItems: "center",
        }}
      >
        {LINKS.map(link => (
          <MuiLink
            key={link.href}
            component={NextLink}
            href={link.href}
            underline="hover"
            sx={{
              color: "text.secondary",
              fontSize: compact ? "0.8rem" : "0.875rem",
              fontWeight: 500,
            }}
          >
            {link.label}
          </MuiLink>
        ))}
        {!compact ? (
          <Typography sx={{ ml: { sm: "auto" }, color: "text.secondary", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} MockBook
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

export default SiteFooter
