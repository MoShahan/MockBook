"use client"

import React, { Suspense, use } from "react"
import { Box, CircularProgress } from "@mui/material"

import AppShell from "@/components/AppShell"

import ProfilePage from "../ProfilePage"

type OtherProfilePageProps = {
  params: Promise<{ userId: string }>
}

const ProfileFallback = () => (
  <AppShell>
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} />
    </Box>
  </AppShell>
)

const OtherProfilePage = ({ params }: OtherProfilePageProps) => {
  const { userId } = use(params)
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfilePage id={userId} />
    </Suspense>
  )
}

export default OtherProfilePage
