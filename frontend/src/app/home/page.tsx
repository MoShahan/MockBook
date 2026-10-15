"use client"

import React from "react"
import { Box, Divider, useMediaQuery } from "@mui/material"

import AdvertWidget from "@/components/AdvertWidget"
import FriendsListWidget from "@/components/FriendsListWidget"
import Navbar from "@/components/Navbar"
import PostsWidget from "@/components/PostsWidget"
import UserWidget from "@/components/UserWidget"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const user = useAppSelector((state: any) => state?.user)

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          gap: "0.5rem",
          justifyContent: "space-between",
          width: "100%",
          padding: "2rem 6%",
          display: isNonMobileScreens ? "flex" : "block",
        }}
      >
        <Box sx={{ flexBasis: isNonMobileScreens ? "26%" : undefined }}>
          <UserWidget url={user?.picturePath} userId={user?._id} />
        </Box>
        <Box sx={{ flexBasis: isNonMobileScreens ? "42%" : undefined, mt: isNonMobileScreens ? undefined : "2rem" }}>
          <MyPostWidget url={user?.picturePath} />
          <Divider sx={{ margin: "1rem" }} />
          <PostsWidget isProfile={false} userId={user?._id}></PostsWidget>
        </Box>
        {isNonMobileScreens && (
          <Box sx={{ flexBasis: "26%" }}>
            <AdvertWidget />
            <Box sx={{ m: "2rem 0" }} />
            <FriendsListWidget userId={user?._id} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default HomePage
