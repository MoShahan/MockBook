"use client"

import React, { Suspense } from "react"
import { Box, CircularProgress } from "@mui/material"

import Navbar from "@/components/Navbar"

import ProfilePage from "./ProfilePage"

const ProfileFallback = () => (
  <Box>
    <Navbar />
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} />
    </Box>
  </Box>
)

const MyProfilePage = () => {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfilePage id="" />
    </Suspense>
  )
}

export default MyProfilePage
