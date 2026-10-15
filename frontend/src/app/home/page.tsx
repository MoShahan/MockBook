"use client"

import React from "react"
import { Box, Divider } from "@mui/material"

import Navbar from "@/components/Navbar"
import PostsWidget from "@/components/PostsWidget"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

const HomePage = () => {
  const user = useAppSelector(state => state.user)

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          padding: "2rem 6%",
        }}
      >
        <MyPostWidget url={user?.picturePath ?? ""} />
        <Divider sx={{ margin: "1rem" }} />
        <PostsWidget isProfile={false} userId={user?._id ?? ""} />
      </Box>
    </Box>
  )
}

export default HomePage
