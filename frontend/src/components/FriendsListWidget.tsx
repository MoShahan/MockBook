"use client"

import { useEffect } from "react"
import { Box, Typography, useTheme } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFriends } from "@/state"

import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type FriendsListWidgetProps = { userId: string }

const FriendsListWidget = ({ userId }: FriendsListWidgetProps) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state: any) => state?.user)
  const theme: any = useTheme()

  const getFriends = async () => {
    const { data } = await api.get(`/${userId}/friends`)
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
        {user?.friends.map((friend: any) => (
          <Friend
            key={friend?.id}
            id={friend.id}
            name={`${friend?.firstName} ${friend?.lastName}`}
            subtitle={friend?.occupation}
            url={friend?.url}
          />
        ))}
      </Box>
    </WidgetWrapper>
  )
}

export default FriendsListWidget
