"use client"

import React, { useEffect, useState } from "react"
import { Box, useMediaQuery } from "@mui/material"

import FriendsListWidget from "@/components/FriendsListWidget"
import Navbar from "@/components/Navbar"
import PostsWidget from "@/components/PostsWidget"
import UserWidget from "@/components/UserWidget"
import { api } from "@/lib/api"

import { useAppSelector } from "../hooks"

type ProfilePageProps = { id: string }

const ProfilePage = ({ id }: ProfilePageProps) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const loggedInUser = useAppSelector((state: any) => state?.user)

  const [user, setUser] = useState<UserType>(null)

  const getUser = async () => {
    const { data } = await api.get(`/users/${id}`)
    setUser(data)
  }

  const getUserPosts = async () => {
    await api.get(`/users/${id}`)
  }

  useEffect(() => {
    if (id) {
      getUser()
    } else {
      setUser(loggedInUser)
    }
  }, [])

  if (!user) {
    return null
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
          <UserWidget url={user?.picturePath} userId={id} />
          <Box sx={{ m: "2rem 0" }} />
          <FriendsListWidget userId={id} />
        </Box>
        <Box sx={{ flexBasis: isNonMobileScreens ? "42%" : undefined, mt: isNonMobileScreens ? undefined : "2rem" }}>
          <PostsWidget isProfile={false} userId={id}></PostsWidget>
        </Box>
      </Box>
    </Box>
  )
}

export default ProfilePage
