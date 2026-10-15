"use client"

import React, { useEffect, useState } from "react"
import {
  EditOutlined,
  LocationOnOutlined,
  ManageAccountsOutlined,
  PersonAddOutlined,
  PersonRemoveOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material"
import { Box, Divider, IconButton, Tooltip, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend, User } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import FlexBetween from "./FlexBetween"
import UserImage from "./UserImage"
import WidgetWrapper from "./WidgetWrapper"

type UserWidgetProps = {
  userId: string
  url: string
  /** When set by the profile page, preferred over id comparison. */
  isOwnProfile?: boolean
}

const UserWidget = ({ userId, url, isOwnProfile: isOwnProfileProp }: UserWidgetProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const loggedInUser = useAppSelector(state => state.user)
  const { success, error: toastError, info } = useToast()
  const { palette } = useTheme()
  const dark = palette.neutral.dark
  const medium = palette.neutral.medium
  const main = palette.neutral.main
  const pLight = palette.primary.light

  const [user, setUser] = useState<User | null>(null)

  const isOwnProfile = isOwnProfileProp ?? sameUserId(loggedInUser?._id, userId)
  const isFriend = Boolean(
    loggedInUser?.friends?.some(friend => sameUserId(friendIdOf(friend), userId))
  )

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const { data } = await api.get<User>(`/users/${userId}`)
      if (!cancelled) setUser(data)
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleGoToProfile = () => {
    if (!userId) return
    if (isOwnProfile) {
      router.push("/profile")
    } else {
      router.push(`/profile/${userId}`)
    }
  }

  const patchFriend = async () => {
    if (!loggedInUser?._id || !userId || isOwnProfile) return
    try {
      const { data } = await api.patch<{ message?: string; friends: Friend[] }>(
        `/users/${loggedInUser._id}/${userId}`,
        {}
      )
      dispatch(setFriends({ friends: data.friends }))
      success(data.message || (isFriend ? "Friend removed" : "Friend added"))
    } catch {
      toastError("Could not update friend")
    }
  }

  if (!user || !sameUserId(user._id, userId)) {
    return null
  }

  const displayUrl = url || user.picturePath || ""
  const friendCount = Array.isArray(user.friends) ? user.friends.length : 0

  return (
    <WidgetWrapper>
      <FlexBetween sx={{ gap: "0.5rem", pb: "1.1rem" }}>
        <FlexBetween onClick={handleGoToProfile} sx={{ gap: "1rem", cursor: "pointer" }}>
          <UserImage image={displayUrl} name={`${user.firstName} ${user.lastName}`} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: dark,
                fontWeight: "500",
                "&:hover": {
                  color: palette.primary.light,
                },
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography sx={{ color: medium }}>{friendCount} friends</Typography>
          </Box>
        </FlexBetween>
        {isOwnProfile ? (
          <Tooltip title="Manage account">
            <IconButton
              sx={{ p: "0.6rem" }}
              onClick={() => info("This feature is coming soon")}
              aria-label="Manage account"
            >
              <ManageAccountsOutlined />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
            <IconButton
              sx={{ backgroundColor: pLight, p: "0.6rem" }}
              onClick={patchFriend}
              aria-label={isFriend ? "Remove friend" : "Add friend"}
            >
              {isFriend ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
            </IconButton>
          </Tooltip>
        )}
      </FlexBetween>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem", mb: "0.5rem" }}>
          <LocationOnOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user.location || "—"}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <WorkOutlineOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user.occupation || "—"}</Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <FlexBetween sx={{ mb: "0.5rem" }}>
          <Typography sx={{ color: medium }}>Number of profile visits</Typography>
          <Typography sx={{ color: main, fontWeight: "500" }}>{user.viewedProfile || 0}</Typography>
        </FlexBetween>
        <FlexBetween>
          <Typography sx={{ color: medium }}>Impressions</Typography>
          <Typography sx={{ color: main, fontWeight: "500" }}>{user.impressions || 0}</Typography>
        </FlexBetween>
      </Box>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <Typography sx={{ color: main, mb: "1rem", fontSize: "1rem", fontWeight: "500" }}>Social Profiles</Typography>
        <FlexBetween sx={{ gap: "1rem", mb: "0.5rem" }}>
          <FlexBetween sx={{ gap: "1rem" }}>
            <img src="../assets/twitter.png" alt="twitter" />
            <Box>
              <Typography sx={{ color: main, fontWeight: "500" }}>Twitter</Typography>
              <Typography sx={{ color: medium, fontWeight: "500" }}>Social Network</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
        <FlexBetween sx={{ gap: "1rem" }}>
          <FlexBetween sx={{ gap: "1rem" }}>
            <img src="../assets/linkedin.png" alt="linkedin" />
            <Box>
              <Typography sx={{ color: main, fontWeight: "500" }}>LinkedIn</Typography>
              <Typography sx={{ color: medium, fontWeight: "500" }}>Network Platform</Typography>
            </Box>
          </FlexBetween>
          <EditOutlined sx={{ color: main }} />
        </FlexBetween>
      </Box>
    </WidgetWrapper>
  )
}

export default UserWidget
