"use client"

import React, { Suspense, use } from "react"
import { Box, CircularProgress } from "@mui/material"

import Navbar from "@/components/Navbar"

import ProfilePage from "../ProfilePage"

type OtherProfilePageProps = {
  params: Promise<{ userId: string }>
}

const ProfileFallback = () => (
  <Box>
    <Navbar />
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} />
    </Box>
  </Box>
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
