"use client"

import React from "react"
import { alpha, Box, Typography, useTheme } from "@mui/material"
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
  /** Initials avatar background when no photo. */
  avatarColor?: string
  /** Avatar size - lists use 48px; post headers keep 55px. */
  avatarSize?: string
  /** When false, hide add/remove-friend (e.g. post cards). Default true. */
  showFriendButton?: boolean
  /** Optional trailing control (e.g. post ⋮ menu). */
  endAction?: React.ReactNode
  /** Soft row hover for list contexts (friends / discover). */
  listHover?: boolean
}

const Friend = ({
  id,
  name,
  subtitle,
  url,
  avatarColor,
  avatarSize = "42px",
  showFriendButton = true,
  endAction,
  listHover = false,
}: FriendProps) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()

  const theme = useTheme()
  const main = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium
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
    <FlexBetween
      sx={{
        width: "100%",
        gap: 1,
        minWidth: 0,
        alignItems: "center",
        ...(listHover
          ? {
              mx: -0.75,
              px: 0.75,
              py: 0.55,
              borderRadius: 2,
              transition: "background-color 0.15s ease",
              "&:hover": {
                bgcolor: alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === "dark" ? 0.08 : 0.05
                ),
              },
            }
          : null),
      }}
    >
      <FlexBetween sx={{ gap: "0.65rem", flex: "1 1 auto", minWidth: 0 }}>
        <Box
          onClick={handleGoToProfile}
          onKeyDown={e => {
            if (!id) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleGoToProfile()
            }
          }}
          role={id ? "link" : undefined}
          tabIndex={id ? 0 : undefined}
          sx={{
            cursor: id ? "pointer" : "default",
            flexShrink: 0,
            borderRadius: "50%",
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <UserImage image={url} name={name} size={avatarSize} bgColor={avatarColor} />
        </Box>
        <Box
          onClick={handleGoToProfile}
          onKeyDown={e => {
            if (!id) return
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              handleGoToProfile()
            }
          }}
          role={id ? "link" : undefined}
          tabIndex={id ? 0 : undefined}
          sx={{
            minWidth: 0,
            flex: "1 1 auto",
            borderRadius: 1,
            "&:focus-visible": {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2,
            },
          }}
        >
          <Typography
            title={name}
            sx={{
              color: main,
              fontWeight: 600,
              fontSize: "0.9rem",
              lineHeight: 1.45,
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              // Padding keeps glyph tops (e.g. “B”) inside the overflow clip box.
              py: "0.1em",
              transition: "color 0.15s ease",
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
              title={subtitle}
              sx={{
                color: medium,
                fontSize: "0.75rem",
                lineHeight: 1.4,
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                py: "0.05em",
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </FlexBetween>
      {(showFriendButton && id && !isSelf) || endAction ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
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
