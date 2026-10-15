"use client"

import { useEffect } from "react"
import { Box, Typography, useTheme } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFriends } from "@/state"
import type { Friend as FriendData } from "@/types/models"

import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type FriendsListWidgetProps = { userId: string }

const FriendsListWidget = ({ userId }: FriendsListWidgetProps) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const theme = useTheme()

  const getFriends = async () => {
    const { data } = await api.get<FriendData[]>(`/${userId}/friends`)
    dispatch(setFriends({ friends: data }))
  }

  useEffect(() => {
    getFriends()
  }, [])

  if (!user?.friends.length) {
    return null
  }

  return (
    <WidgetWrapper>
      <Typography variant="h5" sx={{ fontWeight: "500", color: theme.palette.neutral.dark, mb: "1.5rem" }}>
        List of Friends
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {user.friends.map(friend => {
          const friendId = friend.id ?? friend._id ?? ""
          return (
            <Friend
              key={friendId}
              id={friendId}
              name={`${friend.firstName} ${friend.lastName}`}
              subtitle={friend.occupation ?? ""}
              url={friend.url ?? friend.picturePath ?? ""}
            />
          )
        })}
      </Box>
    </WidgetWrapper>
  )
}

export default FriendsListWidget
