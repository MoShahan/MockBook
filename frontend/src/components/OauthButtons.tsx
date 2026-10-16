"use client"

import { useEffect, useState } from "react"
import { Box, Button, Divider, Typography } from "@mui/material"

import { api, apiUrl } from "@/lib/api"

type OauthProvider = "google" | "github" | "discord"

const LABELS: Record<OauthProvider, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
  discord: "Continue with Discord",
}

type OauthButtonsProps = {
  oauthError?: string | null
}

const OauthButtons = ({ oauthError }: OauthButtonsProps) => {
  const [providers, setProviders] = useState<OauthProvider[]>([])

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
    <Box sx={{ mt: 2, width: "100%" }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          or
        </Typography>
      </Divider>
      {oauthError ? (
        <Typography color="error" sx={{ mb: 1 }} role="alert">
          {oauthError}
        </Typography>
      ) : null}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {providers.map(p => (
          <Button
            key={p}
            variant="outlined"
            fullWidth
            onClick={() => {
              window.location.assign(apiUrl(`/auth/${p}`))
            }}
          >
            {LABELS[p]}
          </Button>
        ))}
      </Box>
    </Box>
  )
}

export default OauthButtons
