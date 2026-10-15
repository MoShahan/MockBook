"use client"

import React from "react"
import { PersonAddOutlined, PersonRemoveOutlined } from "@mui/icons-material"
import { Box, IconButton, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFriends } from "@/state"

import FlexBetween from "./FlexBetween"
import UserImage from "./UserImage"

type FriendProps = {
  id: string
  subtitle: string
  url: string
  name: string
  /** When false, hide add/remove-friend (e.g. post cards). Default true. */
  showFriendButton?: boolean
}

const Friend = ({ id, name, subtitle, url, showFriendButton = true }: FriendProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)

  const theme = useTheme()
  const pLight = theme.palette.primary.light
  const main = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  const isFriend = user?.friends.find(friend => (friend.id ?? friend._id) === id)

  const handleGoToProfile = () => {
    if (!id) return
    if (id === user?._id) {
      router.push("/profile")
    } else {
      router.push(`/profile/${id}`)
    }
    router.refresh()
  }

  const patchFriend = async () => {
    if (!user?._id || !id || user._id === id) return
    const { data } = await api.patch<{ friends: typeof user.friends }>(`/users/${user._id}/${id}`, {})
    dispatch(setFriends({ friends: data.friends }))
  }

  return (
    <FlexBetween>
      <FlexBetween sx={{ gap: "1rem" }}>
        <Box onClick={handleGoToProfile} sx={{ cursor: id ? "pointer" : "default" }}>
          <UserImage image={url} size="55px" />
        </Box>
        <Box onClick={handleGoToProfile}>
          <Typography
            variant="h5"
            sx={{
              color: main,
              fontWeight: "500",
              "&:hover": {
                cursor: id ? "pointer" : "default",
                color: id ? pLight : main,
              },
            }}
          >
            {name}
          </Typography>
          {subtitle ? <Typography sx={{ color: medium, fontSize: "0.75rem" }}>{subtitle}</Typography> : null}
        </Box>
      </FlexBetween>
      {showFriendButton && id && id !== user?._id && (
        <IconButton sx={{ backgroundColor: pLight, p: "0.6rem" }} onClick={patchFriend} aria-label={isFriend ? "Remove friend" : "Add friend"}>
          {isFriend ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
        </IconButton>
      )}
    </FlexBetween>
  )
}

export default Friend
