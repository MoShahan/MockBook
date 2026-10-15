"use client"

import React, { useEffect, useState } from "react"
import { Box, useMediaQuery } from "@mui/material"

import FriendsListWidget from "@/components/FriendsListWidget"
import Navbar from "@/components/Navbar"
import PostsWidget from "@/components/PostsWidget"
import UserWidget from "@/components/UserWidget"
import { api } from "@/lib/api"
import type { User } from "@/types/models"

import { useAppSelector } from "../hooks"

type ProfilePageProps = { id: string }

const ProfilePage = ({ id }: ProfilePageProps) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const loggedInUser = useAppSelector(state => state.user)

  const [user, setUser] = useState<User | null>(null)

  const profileId = id || loggedInUser?._id || ""

  useEffect(() => {
    if (!profileId) return
    let cancelled = false
    void (async () => {
      const { data } = await api.get<User>(`/users/${profileId}`)
      if (!cancelled) setUser(data)
    })()
    return () => {
      cancelled = true
    }
  }, [profileId])

  if (!profileId || !user || user._id !== profileId) {
    return (
      <Box>
        <Navbar />
      </Box>
    )
  }

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          gap: "2rem",
          justifyContent: "center",
          width: "100%",
          padding: "2rem 6%",
          display: isNonMobileScreens ? "flex" : "block",
        }}
      >
        <Box sx={{ flexBasis: isNonMobileScreens ? "26%" : undefined }}>
          <UserWidget url={user.picturePath} userId={profileId} />
          <Box sx={{ m: "2rem 0" }} />
          <FriendsListWidget userId={profileId} />
        </Box>
        <Box sx={{ flexBasis: isNonMobileScreens ? "42%" : undefined, mt: isNonMobileScreens ? undefined : "2rem" }}>
          <PostsWidget isProfile userId={profileId} />
        </Box>
      </Box>
    </Box>
  )
}

export default ProfilePage
