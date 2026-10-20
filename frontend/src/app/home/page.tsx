"use client"

import React, { Suspense, useCallback } from "react"
import { Box, CircularProgress, Tab, Tabs, Typography, useTheme } from "@mui/material"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import AppShell from "@/components/AppShell"
import EmptyState from "@/components/EmptyState"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"
import { segmentedTabsSx } from "@/components/segmentedTabsSx"
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider"

import { useAppSelector } from "../hooks"

import MyPostWidget from "./MyPostWidget"

type HomeTab = "friends" | "everyone"

function tabFromFeedParam(value: string | null): HomeTab {
  return value === "friends" || value === "following" ? "friends" : "everyone"
}

const HomeFallback = () => (
  <AppShell narrow>
    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
      <CircularProgress size={32} />
    </Box>
  </AppShell>
)

const HomePageContent = () => {
  const user = useAppSelector(state => state.user)
  const theme = useTheme()
  const { enabled } = useFeatureFlags()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = tabFromFeedParam(searchParams.get("feed"))

  const setFeedTab = useCallback(
    (next: HomeTab) => {
      const params = new URLSearchParams(searchParams.toString())
      if (next === "everyone") params.delete("feed")
      else params.set("feed", "friends")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

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
          onChange={(_, value: HomeTab) => setFeedTab(value)}
          aria-label="Home feed"
          sx={segmentedTabsSx}
        >
          <Tab value="everyone" label="Everyone" disableRipple />
          <Tab value="friends" label="Following" disableRipple />
        </Tabs>
      </Box>
      <PostsWidget
        key={listKind}
        list={listKind}
        userId={user?._id ?? ""}
        onBrowseEveryone={() => setFeedTab("everyone")}
      />
    </AppShell>
  )
}

const HomePage = () => (
  <Suspense fallback={<HomeFallback />}>
    <HomePageContent />
  </Suspense>
)

export default HomePage
