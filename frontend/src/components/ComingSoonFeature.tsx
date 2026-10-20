"use client"

import { type ReactNode } from "react"
import { Upcoming } from "@mui/icons-material"
import { alpha, Box, Link as MuiLink, Typography, useTheme } from "@mui/material"
import NextLink from "next/link"

import AppShell from "@/components/AppShell"

type ComingSoonFeatureProps = {
  title: string
  summary: string
  details?: string[]
  icon: ReactNode
}

/** Authenticated placeholder for a sidebar destination that is not built yet. */
const ComingSoonFeature = ({ title, summary, details, icon }: ComingSoonFeatureProps) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  return (
    <AppShell narrow>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}>
        <Box
          aria-hidden
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              {title}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                px: 0.85,
                py: 0.2,
                borderRadius: 1,
              }}
            >
              Later
            </Typography>
          </Box>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>{summary}</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          mb: details?.length ? 2.25 : 0,
          p: { xs: 2, sm: 2.25 },
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.28 : 0.16)}`,
        }}
      >
        <Upcoming sx={{ color: "primary.main", mt: 0.15, fontSize: "1.35rem" }} />
        <Typography sx={{ color: "text.secondary", lineHeight: 1.65, fontSize: "0.95rem" }}>
          This page is a placeholder. Nothing here is live yet. See the full{" "}
          <MuiLink component={NextLink} href="/coming-soon" underline="hover" sx={{ fontWeight: 600 }}>
            Coming soon
          </MuiLink>{" "}
          list for other planned work.
        </Typography>
      </Box>

      {details?.length ? (
        <Box
          component="article"
          sx={{
            p: { xs: 2.25, sm: 2.5 },
            borderRadius: 3,
            bgcolor: "background.alt",
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 1, fontSize: "0.95rem" }}>How this will work</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.25, color: "text.secondary" }}>
            {details.map(line => (
              <Typography
                key={line}
                component="li"
                sx={{ fontSize: "0.9rem", lineHeight: 1.6, mb: 0.75, "&:last-child": { mb: 0 } }}
              >
                {line}
              </Typography>
            ))}
          </Box>
        </Box>
      ) : null}
    </AppShell>
  )
}

export default ComingSoonFeature
