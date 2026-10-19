"use client"

import React, { useState } from "react"
import { Box, Tab, Tabs, Typography, useTheme } from "@mui/material"

import AppShell from "@/components/AppShell"
import EmptyState from "@/components/EmptyState"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"
import { segmentedTabsSx } from "@/components/segmentedTabsSx"
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

type HomeTab = "friends" | "everyone"

const HomePage = () => {
  const user = useAppSelector(state => state.user)
  const theme = useTheme()
  const { enabled } = useFeatureFlags()
  const [tab, setTab] = useState<HomeTab>("everyone")

  const listKind: PostsListKind = tab === "friends" ? "friends" : "feed"
  const canCreatePosts = enabled("postsCreate")

  return (
    <AppShell narrow>
      {canCreatePosts ? (
        <MyPostWidget url={user?.picturePath ?? ""} />
      ) : (
        <EmptyState
          title="Posting is temporarily disabled"
          description="Creating new posts is turned off for regular accounts right now. You can still read the feed below."
        />
      )}
      <Box sx={{ mt: "1.15rem", mb: "0.35rem" }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.75,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: theme.palette.neutral.medium,
          }}
        >
          Feed
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, value: HomeTab) => setTab(value)}
          aria-label="Home feed"
          sx={segmentedTabsSx}
        >
          <Tab value="everyone" label="Everyone" disableRipple />
          <Tab value="friends" label="Following" disableRipple />
        </Tabs>
      </Box>
      <PostsWidget key={listKind} list={listKind} userId={user?._id ?? ""} />
    </AppShell>
  )
}

export default HomePage
