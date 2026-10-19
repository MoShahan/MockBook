"use client"

import React, { useMemo } from "react"
import {
  BookmarkBorderOutlined,
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  GridViewOutlined,
} from "@mui/icons-material"
import { Box, Tab, Tabs, useMediaQuery } from "@mui/material"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import AppShell from "@/components/AppShell"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"
import { segmentedTabsSx } from "@/components/segmentedTabsSx"
import { ProfilePageSkeleton } from "@/components/skeletons"
import UserWidget from "@/components/UserWidget"
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider"
import { sameUserId } from "@/types/models"

import { useAppSelector } from "../hooks"

type ProfilePageProps = { id: string }

type OwnTab = "posts" | "saved" | "liked" | "commented"

const tabIconSx = { fontSize: "15px" } as const

const OWN_TABS: {
  value: OwnTab
  label: string
  list: PostsListKind
  icon: React.ReactElement
}[] = [
  { value: "posts", label: "Posts", list: "authored", icon: <GridViewOutlined sx={tabIconSx} /> },
  { value: "saved", label: "Saved", list: "saved", icon: <BookmarkBorderOutlined sx={tabIconSx} /> },
  { value: "liked", label: "Liked", list: "liked", icon: <FavoriteBorderOutlined sx={tabIconSx} /> },
  {
    value: "commented",
    label: "Commented",
    list: "commented",
    icon: <ChatBubbleOutlineOutlined sx={tabIconSx} />,
  },
]

function parseOwnTab(raw: string | null): OwnTab {
  if (raw === "saved" || raw === "liked" || raw === "commented" || raw === "posts") return raw
  return "posts"
}

const ProfilePage = ({ id }: ProfilePageProps) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const loggedInUser = useAppSelector(state => state.user)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { enabled } = useFeatureFlags()
  const canSave = enabled("postsSave")

  const profileId = id || loggedInUser?._id || ""
  // `/profile` (empty id) is always own; `/profile/:id` is own when ids match.
  const isOwnProfile = !id || sameUserId(id, loggedInUser?._id)

  const visibleOwnTabs = useMemo(
    () => OWN_TABS.filter(t => (t.value === "saved" ? canSave : true)),
    [canSave]
  )

  const activeTab = useMemo(() => {
    if (!isOwnProfile) return "posts" as OwnTab
    const parsed = parseOwnTab(searchParams.get("tab"))
    if (parsed === "saved" && !canSave) return "posts"
    return parsed
  }, [isOwnProfile, searchParams, canSave])

  const activeList = visibleOwnTabs.find(t => t.value === activeTab)?.list ?? "authored"

  const handleTabChange = (_: React.SyntheticEvent, value: OwnTab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "posts") params.delete("tab")
    else params.set("tab", value)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Token present but user not hydrated yet (OAuth race) - avoid a blank shell.
  if (!profileId) {
    return (
      <AppShell>
        <ProfilePageSkeleton wide={isNonMobileScreens} />
      </AppShell>
    )
  }

  return (
    <AppShell>
        <Box
          sx={{
            gap: { xs: "1.15rem", md: "1.5rem" },
            width: "100%",
            display: isNonMobileScreens ? "flex" : "block",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              flex: isNonMobileScreens ? "0 0 320px" : undefined,
              width: isNonMobileScreens ? 320 : "100%",
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            <UserWidget
              url={isOwnProfile ? (loggedInUser?.picturePath ?? "") : ""}
              userId={profileId}
              isOwnProfile={isOwnProfile}
            />
          </Box>
          <Box
            sx={{
              flex: isNonMobileScreens ? "1 1 auto" : undefined,
              minWidth: 0,
              width: "100%",
              mt: isNonMobileScreens ? undefined : "1.25rem",
            }}
          >
            {isOwnProfile ? (
              <>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="Profile content sections"
                  sx={segmentedTabsSx}
                >
                  {visibleOwnTabs.map(tab => (
                    <Tab
                      key={tab.value}
                      value={tab.value}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                      disableRipple
                    />
                  ))}
                </Tabs>
                <PostsWidget key={activeList} list={activeList} userId={profileId} />
              </>
            ) : (
              <PostsWidget list="authored" userId={profileId} />
            )}
          </Box>
        </Box>
    </AppShell>
  )
}

export default ProfilePage
