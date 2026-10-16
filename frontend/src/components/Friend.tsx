"use client"

import React from "react"
import { Box, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend as FriendData } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import FlexBetween from "./FlexBetween"
import FriendToggleButton from "./FriendToggleButton"
import UserImage from "./UserImage"

type FriendProps = {
  id: string
  subtitle: string
  url: string
  name: string
  /** When false, hide add/remove-friend (e.g. post cards). Default true. */
  showFriendButton?: boolean
  /** Optional trailing control (e.g. post ⋮ menu). */
  endAction?: React.ReactNode
}

const Friend = ({ id, name, subtitle, url, showFriendButton = true, endAction }: FriendProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()

  const theme = useTheme()
  const main = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium
  // primary.light is too pale on light backgrounds — use main for readable hover.
  const nameHover = theme.palette.primary.main

  const isSelf = sameUserId(user?._id, id)
  const isFriend = Boolean(user?.friends?.some(friend => sameUserId(friendIdOf(friend), id)))

  const handleGoToProfile = () => {
    if (!id) return
    if (isSelf) {
      router.push("/profile")
    } else {
      router.push(`/profile/${id}`)
    }
  }

  const patchFriend = async () => {
    if (!user?._id || !id || isSelf) return
    try {
      const { data } = await api.patch<{ message?: string; friends: FriendData[] }>(
        `/users/friends/${id}`,
        {}
      )
      dispatch(setFriends({ friends: data.friends }))
      success(data.message || (isFriend ? "Friend removed" : "Friend added"))
    } catch {
      toastError("Could not update friend")
    }
  }

  return (
    <FlexBetween sx={{ width: "100%", gap: 1, minWidth: 0 }}>
      <FlexBetween sx={{ gap: "0.75rem", flex: "1 1 auto", minWidth: 0 }}>
        <Box
          onClick={handleGoToProfile}
          sx={{ cursor: id ? "pointer" : "default", flexShrink: 0 }}
        >
          <UserImage image={url} name={name} size="55px" />
        </Box>
        <Box onClick={handleGoToProfile} sx={{ minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
          <Typography
            variant="h5"
            noWrap
            title={name}
            sx={{
              color: main,
              fontWeight: "500",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": {
                cursor: id ? "pointer" : "default",
                color: id ? nameHover : main,
              },
            }}
          >
            {name}
          </Typography>
          {subtitle ? (
            <Typography
              noWrap
              title={subtitle}
              sx={{
                color: medium,
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </FlexBetween>
      {(showFriendButton && id && !isSelf) || endAction ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
          {showFriendButton && id && !isSelf ? (
            <FriendToggleButton isFriend={isFriend} onClick={() => void patchFriend()} />
          ) : null}
          {endAction}
        </Box>
      ) : null}
    </FlexBetween>
  )
}

export default Friend
