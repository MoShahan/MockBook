"use client"

import React, { Suspense } from "react"
import { Box, CircularProgress } from "@mui/material"

import AppShell from "@/components/AppShell"

import ProfilePage from "./ProfilePage"

const ProfileFallback = () => (
  <AppShell>
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} />
    </Box>
  </AppShell>
)

const MyProfilePage = () => {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfilePage id="" />
    </Suspense>
  )
}

export default MyProfilePage
