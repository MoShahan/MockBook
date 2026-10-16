"use client"

import React, { useMemo } from "react"
import { Box, Tab, Tabs, useMediaQuery } from "@mui/material"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import FriendsListWidget from "@/components/FriendsListWidget"
import Navbar from "@/components/Navbar"
import PageShell from "@/components/PageShell"
import PostsWidget, { type PostsListKind } from "@/components/PostsWidget"
import UserWidget from "@/components/UserWidget"
import { sameUserId } from "@/types/models"

import { useAppSelector } from "../hooks"

type ProfilePageProps = { id: string }

type OwnTab = "posts" | "saved" | "liked" | "commented"

const OWN_TABS: { value: OwnTab; label: string; list: PostsListKind }[] = [
  { value: "posts", label: "Posts", list: "authored" },
  { value: "saved", label: "Saved", list: "saved" },
  { value: "liked", label: "Liked", list: "liked" },
  { value: "commented", label: "Commented", list: "commented" },
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

  const profileId = id || loggedInUser?._id || ""
  // `/profile` (empty id) is always own; `/profile/:id` is own when ids match.
  const isOwnProfile = !id || sameUserId(id, loggedInUser?._id)

  const activeTab = useMemo(() => {
    if (!isOwnProfile) return "posts" as OwnTab
    return parseOwnTab(searchParams.get("tab"))
  }, [isOwnProfile, searchParams])

  const activeList = OWN_TABS.find(t => t.value === activeTab)?.list ?? "authored"

  const handleTabChange = (_: React.SyntheticEvent, value: OwnTab) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "posts") params.delete("tab")
    else params.set("tab", value)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Single GET /users/:id lives in UserWidget so profile visits are not double-counted.
  if (!profileId) {
    return (
      <Box>
        <Navbar />
      </Box>
    )
  }

  return (
    <Box>
      <Navbar />
      <PageShell>
        <Box
          sx={{
            gap: "2rem",
            justifyContent: "center",
            width: "100%",
            display: isNonMobileScreens ? "flex" : "block",
          }}
        >
          <Box sx={{ flexBasis: isNonMobileScreens ? "26%" : undefined }}>
            <UserWidget
              url={isOwnProfile ? (loggedInUser?.picturePath ?? "") : ""}
              userId={profileId}
              isOwnProfile={isOwnProfile}
            />
            <Box sx={{ m: "2rem 0" }} />
            <FriendsListWidget userId={profileId} />
          </Box>
          <Box
            sx={{
              flexBasis: isNonMobileScreens ? "42%" : undefined,
              mt: isNonMobileScreens ? undefined : "2rem",
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
                  sx={{ mb: "1rem", borderBottom: 1, borderColor: "divider" }}
                >
                  {OWN_TABS.map(tab => (
                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                  ))}
                </Tabs>
                <PostsWidget key={activeList} list={activeList} userId={profileId} />
              </>
            ) : (
              <PostsWidget list="authored" userId={profileId} />
            )}
          </Box>
        </Box>
      </PageShell>
    </Box>
  )
}

export default ProfilePage
