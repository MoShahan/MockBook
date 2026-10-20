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
        mt: compact ? 2 : 3,
        pt: compact ? 1.5 : 2,
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: compact ? "100%" : PAGE_MAX_WIDTH,
          margin: "0 auto",
          px: compact ? 0 : { xs: 2, sm: 3, md: 4 },
          pb: compact ? 0 : 2,
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
          <Box
            sx={{
              ml: { sm: "auto" },
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.secondary",
            }}
          >
            <Box
              component="img"
              src="/assets/xivi-mark.png"
              alt=""
              aria-hidden
              width={18}
              height={18}
              draggable={false}
              sx={{
                width: 18,
                height: 18,
                aspectRatio: "1 / 1",
                objectFit: "contain",
                borderRadius: "0.3rem",
                opacity: 0.85,
              }}
            />
            <Typography sx={{ color: "inherit", fontSize: "0.8rem" }}>
              © {new Date().getFullYear()} Xivi
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

export default SiteFooter
