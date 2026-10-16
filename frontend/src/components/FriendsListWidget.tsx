"use client"

import { useEffect, useState } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFriends } from "@/state"
import type { Friend as FriendData } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type FriendsListWidgetProps = { userId: string }

const FriendsListWidget = ({ userId }: FriendsListWidgetProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const loggedInUser = useAppSelector(state => state.user)
  const theme = useTheme()
  const [otherFriends, setOtherFriends] = useState<{ forUserId: string; friends: FriendData[] } | null>(
    null
  )

  const isOwnList = sameUserId(loggedInUser?._id, userId)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const { data } = await api.get<FriendData[]>(`/users/${userId}/friends`)
      if (cancelled) return
      if (sameUserId(loggedInUser?._id, userId)) {
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
    : sameUserId(otherFriends?.forUserId, userId)
      ? otherFriends!.friends
      : null

  if (friends == null) {
    return (
      <WidgetWrapper sx={{ overflow: "hidden" }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.neutral.dark, mb: "0.85rem" }}
        >
          Friends
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }} role="status">
          <CircularProgress size={24} />
        </Box>
      </WidgetWrapper>
    )
  }

  return (
    <WidgetWrapper sx={{ overflow: "hidden" }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: theme.palette.neutral.dark, mb: "0.65rem" }}
      >
        Friends
      </Typography>
      {!friends.length ? (
        <EmptyState
          title="No friends yet"
          description="Find people from Home → Add people, or visit a profile and add them."
          actionLabel={isOwnList ? "Go to Home" : undefined}
          onAction={isOwnList ? () => router.push("/home") : undefined}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.35rem", width: "100%", minWidth: 0 }}>
          {friends.map(friend => {
            const id = friendIdOf(friend)
            return (
              <Friend
                key={id}
                id={id}
                name={`${friend.firstName} ${friend.lastName}`}
                subtitle={friend.occupation ?? ""}
                url={friend.picturePath ?? friend.url ?? ""}
                avatarColor={friend.avatarColor}
                avatarSize="36px"
                showFriendButton
                listHover
              />
            )
          })}
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default FriendsListWidget
