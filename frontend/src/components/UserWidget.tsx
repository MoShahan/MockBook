"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Facebook,
  Instagram,
  LinkedIn,
  LocationOnOutlined,
  ManageAccountsOutlined,
  WorkOutlineOutlined,
  X,
} from "@mui/icons-material"
import { alpha, Box, Divider, IconButton, Link, Tooltip, Typography, useTheme } from "@mui/material"
import { usePathname, useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import {
  DEFAULT_AVATAR_COLOR,
  DEFAULT_COVER_COLOR,
  normalizeProfileColor,
} from "@/lib/profileColors"
import { SOCIAL_NETWORKS, type SocialNetwork, socialProfileUrl } from "@/lib/social"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend, User } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import EditProfileDialog from "./EditProfileDialog"
import FlexBetween from "./FlexBetween"
import FriendToggleButton from "./FriendToggleButton"
import UserImage from "./UserImage"
import WidgetWrapper from "./WidgetWrapper"

type UserWidgetProps = {
  userId: string
  url: string
  /** When set by the profile page, preferred over id comparison. */
  isOwnProfile?: boolean
}

const SOCIAL_ICONS: Record<SocialNetwork, React.ReactNode> = {
  facebook: <Facebook />,
  x: <X />,
  linkedin: <LinkedIn />,
  instagram: <Instagram />,
}

const UserWidget = ({ userId, url, isOwnProfile: isOwnProfileProp }: UserWidgetProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const loggedInUser = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()
  const theme = useTheme()
  const { palette } = theme
  const dark = palette.neutral.dark
  const medium = palette.neutral.medium
  const main = palette.neutral.main

  const [fetched, setFetched] = useState<User | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const isOwnProfile = isOwnProfileProp ?? sameUserId(loggedInUser?._id, userId)
  const isFriend = Boolean(
    loggedInUser?.friends?.some(friend => sameUserId(friendIdOf(friend), userId))
  )

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const { data } = await api.get<User>(`/users/${userId}`)
      if (!cancelled) setFetched(data)
    })()
    return () => {
      cancelled = true
    }
  }, [userId])

  const user = useMemo(() => {
    if (!fetched || !sameUserId(fetched._id, userId)) return null
    if (isOwnProfile && loggedInUser && sameUserId(loggedInUser._id, userId)) {
      return {
        ...fetched,
        firstName: loggedInUser.firstName,
        lastName: loggedInUser.lastName,
        location: loggedInUser.location,
        occupation: loggedInUser.occupation,
        picturePath: loggedInUser.picturePath,
        avatarColor: loggedInUser.avatarColor ?? fetched.avatarColor,
        coverColor: loggedInUser.coverColor ?? fetched.coverColor,
        facebook: loggedInUser.facebook,
        x: loggedInUser.x,
        linkedin: loggedInUser.linkedin,
        instagram: loggedInUser.instagram,
        friends: loggedInUser.friends ?? fetched.friends,
        // Prefer API value so visit counts stay current after others view the profile.
        viewedProfile: fetched.viewedProfile ?? loggedInUser.viewedProfile,
      }
    }
    return fetched
  }, [fetched, userId, isOwnProfile, loggedInUser])

  // Already on this profile (own `/profile` or `/profile/:id`) - don't re-navigate.
  const alreadyOnThisProfile =
    Boolean(userId) &&
    (pathname === `/profile/${userId}` || (isOwnProfile && (pathname === "/profile" || pathname === `/profile/${userId}`)))

  const handleGoToProfile = () => {
    if (!userId || alreadyOnThisProfile) return
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
        `/users/friends/${userId}`,
        {}
      )
      dispatch(setFriends({ friends: data.friends }))
      success(data.message || (isFriend ? "Friend removed" : "Friend added"))
    } catch {
      toastError("Could not update friend")
    }
  }

  if (!user) {
    return (
      <WidgetWrapper>
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }} role="status">
          <Typography sx={{ color: medium }}>Loading profile…</Typography>
        </Box>
      </WidgetWrapper>
    )
  }

  const displayUrl = url || user.picturePath || ""
  const friendCount = Array.isArray(user.friends) ? user.friends.length : 0
  const avatarColor = normalizeProfileColor(user.avatarColor, DEFAULT_AVATAR_COLOR)
  const coverColor = normalizeProfileColor(user.coverColor, DEFAULT_COVER_COLOR)

  const activeSocials = SOCIAL_NETWORKS.filter(({ key }) => Boolean((user[key] || "").trim())).map(
    ({ key, label }) => ({
      key,
      label,
      handle: (user[key] || "").trim(),
      href: socialProfileUrl(key, user[key]),
    })
  )

  const coverRadius = `${Number(theme.shape.borderRadius) * 1.25}px`

  return (
    <WidgetWrapper sx={{ p: 0, overflow: "visible" }}>
      <Box
        sx={{
          height: { xs: 72, sm: 84 },
          bgcolor: coverColor,
          position: "relative",
          borderTopLeftRadius: coverRadius,
          borderTopRightRadius: coverRadius,
        }}
      >
        <Box sx={{ position: "absolute", top: 6, right: 6, zIndex: 2 }}>
          {isOwnProfile ? (
            <Tooltip title="Edit profile">
              <IconButton
                size="small"
                sx={{
                  bgcolor: theme => alpha(theme.palette.common.black, 0.28),
                  color: "common.white",
                  "&:hover": { bgcolor: theme => alpha(theme.palette.common.black, 0.42) },
                }}
                onClick={() => setEditOpen(true)}
                aria-label="Edit profile"
              >
                <ManageAccountsOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <FriendToggleButton isFriend={isFriend} onClick={() => void patchFriend()} />
          )}
        </Box>
      </Box>

      <Box sx={{ px: "1.15rem", pb: "1.15rem", pt: 0, position: "relative", zIndex: 1 }}>
        <FlexBetween sx={{ gap: "0.5rem", pb: "0.85rem", mt: "-1.85rem" }}>
          <FlexBetween
            onClick={handleGoToProfile}
            sx={{ gap: "0.75rem", cursor: alreadyOnThisProfile ? "default" : "pointer", minWidth: 0 }}
          >
            <Box
              sx={{
                borderRadius: "50%",
                border: theme => `3px solid ${theme.palette.background.paper}`,
                boxShadow: theme => `0 0 0 1px ${theme.palette.divider}`,
                position: "relative",
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              <UserImage
                image={displayUrl}
                name={`${user.firstName} ${user.lastName}`}
                size="52px"
                bgColor={avatarColor}
              />
            </Box>
            <Box sx={{ minWidth: 0, pt: "2.35rem" }}>
              <Typography
                variant="h4"
                noWrap
                sx={{
                  color: dark,
                  fontWeight: 600,
                  lineHeight: 1.25,
                  fontSize: "1.1rem",
                  ...(!alreadyOnThisProfile && {
                    "&:hover": {
                      color: palette.primary.main,
                    },
                  }),
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: medium, mt: 0.15 }}>
                {friendCount} friends
              </Typography>
            </Box>
          </FlexBetween>
        </FlexBetween>

      <Divider />

      <Box sx={{ py: "0.75rem" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.65rem", mb: "0.4rem" }}>
          <LocationOnOutlined sx={{ fontSize: "1.15rem", color: main }} />
          <Typography variant="body2" sx={{ color: medium }}>
            {user.location?.trim() || "-"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <WorkOutlineOutlined sx={{ fontSize: "1.15rem", color: main }} />
          <Typography variant="body2" sx={{ color: medium }}>
            {user.occupation?.trim() || "-"}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ py: "0.75rem" }}>
        <FlexBetween>
          <Typography variant="body2" sx={{ color: medium }}>
            Profile visits
          </Typography>
          <Typography variant="body2" sx={{ color: main, fontWeight: 600 }}>
            {user.viewedProfile || 0}
          </Typography>
        </FlexBetween>
      </Box>

      {activeSocials.length > 0 ? (
        <>
          <Divider />
          <Box sx={{ py: "0.75rem" }}>
            <Typography variant="subtitle2" sx={{ color: main, mb: "0.65rem" }}>
              Social Profiles
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              {activeSocials.map(item =>
                item.href ? (
                  <FlexBetween key={item.key} sx={{ gap: "0.75rem" }}>
                    <FlexBetween sx={{ gap: "0.65rem", minWidth: 0 }}>
                      <Box sx={{ color: main, display: "flex", "& svg": { fontSize: "1.15rem" } }} aria-hidden>
                        {SOCIAL_ICONS[item.key]}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: main, fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Link
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ color: medium, fontWeight: 500, fontSize: "0.8125rem" }}
                        >
                          @{item.handle}
                        </Link>
                      </Box>
                    </FlexBetween>
                  </FlexBetween>
                ) : null
              )}
            </Box>
          </Box>
        </>
      ) : null}
      </Box>

      {isOwnProfile ? (
        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          user={user}
          onSaved={saved => setFetched(saved)}
        />
      ) : null}
    </WidgetWrapper>
  )
}

export default UserWidget
