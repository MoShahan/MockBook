"use client"

import { useEffect, useState } from "react"
import { Box, Button, CircularProgress, Typography } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch } from "@/app/hooks"
import { api } from "@/lib/api"
import { useToast } from "@/providers/ToastProvider"
import { setLogin, setLogout, setTokens } from "@/state"
import type { User } from "@/types/models"

function clearOAuthHash() {
  if (typeof window === "undefined") return
  window.history.replaceState(null, "", "/auth/callback")
}

export default function OAuthCallbackPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { success, error: toastError } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : ""
        const params = new URLSearchParams(hash)
        const accessToken = params.get("accessToken")
        const refreshToken = params.get("refreshToken")
        if (!accessToken || !refreshToken) {
          clearOAuthHash()
          dispatch(setLogout())
          if (!cancelled) setError("Missing OAuth tokens")
          return
        }

        // Store tokens first so the Bearer interceptor can call /auth/me.
        // AuthProvider must NOT redirect away from this route until we finish setLogin.
        dispatch(setTokens({ accessToken, refreshToken }))
        const { data } = await api.get<{ user: User }>("/auth/me")
        if (cancelled) return
        dispatch(setLogin({ user: data.user, accessToken, refreshToken }))
        clearOAuthHash()
        success("Signed in")
        router.replace("/home")
      } catch {
        clearOAuthHash()
        dispatch(setLogout())
        if (!cancelled) {
          setError("Could not complete sign-in")
          toastError("Could not complete sign-in")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [dispatch, router, success, toastError])

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 2,
      }}
    >
      {error ? (
        <>
          <Typography color="error" role="alert" sx={{ textAlign: "center" }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => router.replace("/login")} sx={{ textTransform: "none" }}>
            Back to login
          </Button>
        </>
      ) : (
        <>
          <CircularProgress />
          <Typography>Signing you in…</Typography>
        </>
      )}
    </Box>
  )
}
