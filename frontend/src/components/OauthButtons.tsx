"use client"

import { type ReactNode, useEffect, useState } from "react"
import { GitHub } from "@mui/icons-material"
import { alpha, Box, Button, Divider, SvgIcon, Typography, useTheme } from "@mui/material"

import { api, apiUrl } from "@/lib/api"

type OauthProvider = "google" | "github" | "discord"

type OauthButtonsProps = {
  oauthError?: string | null
}

/** Official-style multicolor Google "G". */
function GoogleIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="small" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </SvgIcon>
  )
}

function DiscordIcon() {
  return (
    <SvgIcon viewBox="0 0 24 24" fontSize="small" aria-hidden sx={{ color: "#5865F2" }}>
      <path
        fill="currentColor"
        d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.36-.76-.54-1.09a.1.1 0 0 0-.07-.03c-1.5.26-2.94.71-4.27 1.33a.09.09 0 0 0-.04.03C2.2 9.14 1.45 12.84 1.83 16.5a.1.1 0 0 0 .04.07c1.8 1.32 3.53 2.12 5.24 2.65a.1.1 0 0 0 .11-.03c.4-.55.76-1.13 1.07-1.74a.1.1 0 0 0-.05-.14 10.7 10.7 0 0 1-1.56-.74.1.1 0 0 1-.01-.17c.1-.08.21-.16.31-.24a.1.1 0 0 1 .1-.01c3.28 1.5 6.83 1.5 10.07 0a.1.1 0 0 1 .1.01c.1.08.21.16.31.24a.1.1 0 0 1-.01.17c-.5.3-1.01.55-1.56.74a.1.1 0 0 0-.05.14c.32.61.68 1.19 1.07 1.74a.1.1 0 0 0 .11.03c1.72-.53 3.45-1.33 5.25-2.65a.1.1 0 0 0 .04-.07c.45-4.23-.76-7.9-3.22-11.14a.07.07 0 0 0-.03-.03zM8.68 14.43c-.99 0-1.8-.9-1.8-2.01s.8-2.01 1.8-2.01 1.81.9 1.8 2.01-.8 2.01-1.8 2.01zm6.65 0c-.99 0-1.8-.9-1.8-2.01s.8-2.01 1.8-2.01 1.81.9 1.8 2.01-.81 2.01-1.8 2.01z"
      />
    </SvgIcon>
  )
}

const PROVIDER_UI: Record<OauthProvider, { label: string; icon: ReactNode }> = {
  google: { label: "Google", icon: <GoogleIcon /> },
  github: { label: "GitHub", icon: <GitHub fontSize="small" /> },
  discord: { label: "Discord", icon: <DiscordIcon /> },
}

const OauthButtons = ({ oauthError }: OauthButtonsProps) => {
  const theme = useTheme()
  const [providers, setProviders] = useState<OauthProvider[]>([])
  const isDark = theme.palette.mode === "dark"

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data } = await api.get<{ providers: OauthProvider[] }>("/auth/providers")
        if (!cancelled) setProviders(data.providers || [])
      } catch {
        if (!cancelled) setProviders([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (!providers.length && !oauthError) return null

  return (
    <Box sx={{ mt: 1, width: "100%" }}>
      <Divider sx={{ my: 2.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ px: 1, letterSpacing: "0.04em" }}>
          or continue with
        </Typography>
      </Divider>
      {oauthError ? (
        <Typography color="error" sx={{ mb: 1.5 }} role="alert">
          {oauthError}
        </Typography>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: providers.length === 1 ? "1fr" : `repeat(${Math.min(providers.length, 3)}, 1fr)`,
          gap: 1,
        }}
      >
        {providers.map(p => {
          const ui = PROVIDER_UI[p]

          return (
            <Button
              key={p}
              variant="outlined"
              onClick={() => {
                window.location.assign(apiUrl(`/auth/${p}`))
              }}
              aria-label={`Continue with ${ui.label}`}
              sx={{
                minHeight: 44,
                px: 1.5,
                py: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                letterSpacing: 0,
                lineHeight: 1.2,
                borderColor: theme.palette.divider,
                color: theme.palette.text.primary,
                bgcolor: alpha(theme.palette.common.white, isDark ? 0.03 : 0.55),
                boxShadow: "none",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.common.white, isDark ? 0.06 : 0.85),
                  boxShadow: "none",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 0 }}>
                {ui.icon}
              </Box>
              {ui.label}
            </Button>
          )
        })}
      </Box>
    </Box>
  )
}

export default OauthButtons
