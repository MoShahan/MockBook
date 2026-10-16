"use client"

import React from "react"
import { Box, Divider, useMediaQuery } from "@mui/material"

import AddPeopleWidget from "@/components/AddPeopleWidget"
import Navbar from "@/components/Navbar"
import PostsWidget from "@/components/PostsWidget"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

const HomePage = () => {
  const user = useAppSelector(state => state.user)
  const isWide = useMediaQuery("(min-width:1000px)")

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          width: "100%",
          padding: "2rem 6%",
          display: isWide ? "flex" : "block",
          gap: "2rem",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flexBasis: isWide ? "60%" : undefined, maxWidth: "680px", width: "100%" }}>
          <MyPostWidget url={user?.picturePath ?? ""} />
          <Divider sx={{ margin: "1rem" }} />
          <PostsWidget isProfile={false} userId={user?._id ?? ""} />
        </Box>
        {isWide ? (
          <Box sx={{ flexBasis: "28%", maxWidth: "340px", position: "sticky", top: "6rem" }}>
            <AddPeopleWidget />
          </Box>
        ) : (
          <Box sx={{ mt: "1.5rem", maxWidth: "680px", width: "100%" }}>
            <AddPeopleWidget />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default HomePage
