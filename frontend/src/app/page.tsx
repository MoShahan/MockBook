"use client"

import { useEffect } from "react"
import { Box, CircularProgress } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"

/** Root `/`: send authenticated users to `/home`, everyone else to `/login`. */
export default function RootPage() {
  const router = useRouter()
  const accessToken = useAppSelector(state => state.accessToken)

  useEffect(() => {
    router.replace(accessToken ? "/home" : "/login")
  }, [accessToken, router])

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <CircularProgress aria-label="Redirecting" />
    </Box>
  )
}
