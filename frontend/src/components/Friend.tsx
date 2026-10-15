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

type FriendProps = { id: string; subtitle: string; url: string; name: string }

const Friend = ({ id, name, subtitle, url }: FriendProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)

  const theme = useTheme()
  const pLight = theme.palette.primary.light
  const main = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  const isFriend = user?.friends.find(friend => (friend.id ?? friend._id) === id)

  const handleGoToProfile = () => {
    if (id === user?._id) {
      router.push("/profile")
    } else {
      router.push(`/profile/${id}`)
    }
    router.refresh()
  }

  const patchFriend = async () => {
    const { data } = await api.patch(`/users/${user?._id}/${id}`, {})
    dispatch(setFriends({ friends: data.friends }))
  }

  return (
    <FlexBetween>
      <FlexBetween sx={{ gap: "1rem" }}>
        <UserImage image={url} size="55px" />
        <Box onClick={handleGoToProfile}>
          <Typography
            variant="h5"
            sx={{
              color: main,
              fontWeight: "500",
              "&:hover": {
                cursor: "pointer",
                color: pLight,
              },
            }}
          >
            {name}
          </Typography>
          <Typography sx={{ color: medium, fontSize: "0.75rem" }}>{subtitle}</Typography>
        </Box>
      </FlexBetween>
      <IconButton sx={{ backgroundColor: pLight, p: "0.6rem" }} onClick={patchFriend}>
        {isFriend ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
      </IconButton>
    </FlexBetween>
  )
}

export default Friend
