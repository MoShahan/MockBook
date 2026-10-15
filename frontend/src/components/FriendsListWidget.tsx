"use client"

import { useEffect, useState } from "react"
import { Box, Typography, useTheme } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFriends } from "@/state"
import type { Friend as FriendData } from "@/types/models"
import { friendIdOf } from "@/types/models"

import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type FriendsListWidgetProps = { userId: string }

const FriendsListWidget = ({ userId }: FriendsListWidgetProps) => {
  const dispatch = useAppDispatch()
  const loggedInUser = useAppSelector(state => state.user)
  const theme = useTheme()
  const [otherFriends, setOtherFriends] = useState<{ forUserId: string; friends: FriendData[] } | null>(
    null
  )

  const isOwnList = Boolean(loggedInUser?._id && loggedInUser._id === userId)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const { data } = await api.get<FriendData[]>(`/users/${userId}/friends`)
      if (cancelled) return
      if (loggedInUser?._id === userId) {
        dispatch(setFriends({ friends: data }))
      } else {
        setOtherFriends({ forUserId: userId, friends: data })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, loggedInUser?._id, dispatch])

  const friends: FriendData[] | null = isOwnList
    ? (loggedInUser?.friends ?? [])
    : otherFriends?.forUserId === userId
      ? otherFriends.friends
      : null

  if (friends == null) {
    return null
  }

  return (
    <WidgetWrapper>
      <Typography variant="h5" sx={{ fontWeight: "500", color: theme.palette.neutral.dark, mb: "1.5rem" }}>
        List of Friends
      </Typography>
      {!friends.length ? (
        <Typography sx={{ color: theme.palette.neutral.medium }}>No friends yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {friends.map(friend => {
            const id = friendIdOf(friend)
            return (
              <Friend
                key={id}
                id={id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation ?? ""}
                url={friend.picturePath ?? friend.url ?? ""}
                showFriendButton
              />
            )
          })}
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default FriendsListWidget
