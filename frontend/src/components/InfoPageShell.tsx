"use client"

import { type ReactNode } from "react"
import { Box, Button, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"
import BrandLogo from "@/components/BrandLogo"
import Navbar from "@/components/Navbar"
import PageShell, { PAGE_MAX_WIDTH } from "@/components/PageShell"
import SiteFooter from "@/components/SiteFooter"

type InfoPageShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

/**
 * Shell for Help / Privacy / Terms — Navbar when signed in, minimal header when public.
 */
const InfoPageShell = ({ title, subtitle, children }: InfoPageShellProps) => {
  const theme = useTheme()
  const router = useRouter()
  const isAuth = Boolean(useAppSelector(state => state.accessToken))

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      {isAuth ? (
        <Navbar />
      ) : (
        <Box
          component="header"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.alt",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: PAGE_MAX_WIDTH,
              margin: "0 auto",
              px: { xs: 2, sm: 3, md: 4 },
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <BrandLogo size="nav" onClick={() => router.push("/login")} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={() => router.push("/login")} sx={{ textTransform: "none" }}>
                Sign in
              </Button>
              <Button variant="contained" onClick={() => router.push("/register")} sx={{ textTransform: "none" }}>
                Create account
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <PageShell narrow sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography sx={{ color: "text.secondary", mb: 3, lineHeight: 1.6 }}>{subtitle}</Typography>
        ) : (
          <Box sx={{ mb: 3 }} />
        )}
        {children}
      </PageShell>

      <SiteFooter />
    </Box>
  )
}

export default InfoPageShell
