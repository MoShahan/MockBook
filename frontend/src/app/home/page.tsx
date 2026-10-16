"use client"

import React, { useState } from "react"
import { Box, Divider, Tab, Tabs, useMediaQuery } from "@mui/material"

import AddPeopleWidget from "@/components/AddPeopleWidget"
import Navbar from "@/components/Navbar"
import PageShell from "@/components/PageShell"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

type HomeTab = "friends" | "everyone"

const HomePage = () => {
  const user = useAppSelector(state => state.user)
  const isWide = useMediaQuery("(min-width:1000px)")
  const [tab, setTab] = useState<HomeTab>("everyone")

  const listKind: PostsListKind = tab === "friends" ? "friends" : "feed"

  return (
    <Box>
      <Navbar />
      <PageShell>
        <Box
          sx={{
            display: isWide ? "flex" : "block",
            gap: "2rem",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flexBasis: isWide ? "60%" : undefined, maxWidth: "680px", width: "100%" }}>
            <MyPostWidget url={user?.picturePath ?? ""} />
            <Divider sx={{ margin: "1rem 0" }} />
            <Tabs
              value={tab}
              onChange={(_, value: HomeTab) => setTab(value)}
              aria-label="Home feed"
              sx={{ mb: "1rem", borderBottom: 1, borderColor: "divider" }}
            >
              <Tab value="everyone" label="Everyone" />
              <Tab value="friends" label="Friends" />
            </Tabs>
            <PostsWidget key={listKind} list={listKind} userId={user?._id ?? ""} />
          </Box>
          {isWide ? (
            <Box sx={{ flexBasis: "28%", maxWidth: "340px", position: "sticky", top: "5.5rem" }}>
              <AddPeopleWidget />
            </Box>
          ) : (
            <Box sx={{ mt: "1.5rem", maxWidth: "680px", width: "100%" }}>
              <AddPeopleWidget />
            </Box>
          )}
        </Box>
      </PageShell>
    </Box>
  )
}

export default HomePage
