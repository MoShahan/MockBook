"use client"

import { useEffect, useState } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setFollowing, setFriends } from "@/state"
import type { Friend as FriendData } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type ListKind = "friends" | "following"

type PeopleListWidgetProps = {
  userId: string
  /** `friends` = accepted mutual friends (any profile). `following` = people I follow (own profile only). */
  kind: ListKind
}

const COPY: Record<
  ListKind,
  { title: string; emptyTitle: string; emptyOwn: string; emptyOther: string; actionLabel?: string }
> = {
  friends: {
    title: "Friends",
    emptyTitle: "No friends yet",
    emptyOwn: "Send a friend request from Home → Add people, or visit a profile.",
    emptyOther: "This person hasn’t added any friends yet.",
    actionLabel: "Go to Home",
  },
  following: {
    title: "Following",
    emptyTitle: "Not following anyone",
    emptyOwn: "Follow people to see their posts in your Following feed.",
    emptyOther: "",
    actionLabel: "Find people",
  },
}

const PeopleListWidget = ({ userId, kind }: PeopleListWidgetProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const loggedInUser = useAppSelector(state => state.user)
  const theme = useTheme()
  const isOwnList = sameUserId(loggedInUser?._id, userId)
  const hideFollowing = kind === "following" && !isOwnList
  /** Re-fetch following when Follow/Unfollow updates Redux ids. */
  const followingSig =
    kind === "following"
      ? [...(loggedInUser?.following || [])].map(String).sort().join(",")
      : ""

  const [remote, setRemote] = useState<{ forUserId: string; people: FriendData[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || hideFollowing) return

    let cancelled = false
    void (async () => {
      try {
        if (kind === "friends") {
          const { data } = await api.get<FriendData[]>(`/users/${userId}/friends`)
          if (cancelled) return
          if (sameUserId(loggedInUser?._id, userId)) {
            dispatch(setFriends({ friends: data }))
          } else {
            setRemote({ forUserId: userId, people: data })
          }
        } else {
          const { data } = await api.get<{ following: FriendData[] }>("/users/me/following")
          if (cancelled) return
          const people = data.following || []
          const ids = people.map(p => String(p._id))
          dispatch(setFollowing({ following: ids }))
          setRemote({ forUserId: userId, people })
        }
      } catch {
        if (!cancelled) setRemote({ forUserId: userId, people: [] })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // followingSig intentionally refreshes the following list after follow/unfollow.
  }, [userId, loggedInUser?._id, dispatch, kind, hideFollowing, followingSig])

  if (hideFollowing) return null

  const copy = COPY[kind]

  let people: FriendData[] | null = null
  if (kind === "friends" && isOwnList) {
    people = loggedInUser?.friends ?? []
  } else if (sameUserId(remote?.forUserId, userId)) {
    people = remote!.people
  } else if (loading) {
    people = null
  } else {
    people = []
  }

  if (people == null) {
    return (
      <WidgetWrapper sx={{ overflow: "hidden" }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.neutral.dark, mb: "0.85rem" }}
        >
          {copy.title}
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
        {copy.title}
        {people.length > 0 ? (
          <Typography component="span" sx={{ ml: 0.75, color: "text.secondary", fontWeight: 500 }}>
            ({people.length})
          </Typography>
        ) : null}
      </Typography>
      {!people.length ? (
        <EmptyState
          title={copy.emptyTitle}
          description={isOwnList ? copy.emptyOwn : copy.emptyOther}
          actionLabel={isOwnList && copy.actionLabel ? copy.actionLabel : undefined}
          onAction={isOwnList ? () => router.push("/home") : undefined}
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.35rem", width: "100%", minWidth: 0 }}>
          {people.map(person => {
            const id = friendIdOf(person)
            return (
              <Friend
                key={id}
                id={id}
                name={`${person.firstName} ${person.lastName}`}
                subtitle={person.occupation ?? ""}
                url={person.picturePath ?? person.url ?? ""}
                avatarColor={person.avatarColor}
                avatarSize="36px"
                showFriendButton={isOwnList}
                listHover
              />
            )
          })}
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default PeopleListWidget
