"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Facebook,
  Instagram,
  LinkedIn,
  LocationOnOutlined,
  ManageAccountsOutlined,
  PersonAddOutlined,
  PersonRemoveOutlined,
  WorkOutlineOutlined,
  X,
} from "@mui/icons-material"
import { Box, Divider, IconButton, Link, Tooltip, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { SOCIAL_NETWORKS, type SocialNetwork,socialProfileUrl } from "@/lib/social"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend, User } from "@/types/models"
import { friendIdOf, sameUserId } from "@/types/models"

import EditProfileDialog from "./EditProfileDialog"
import FlexBetween from "./FlexBetween"
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
  const dispatch = useAppDispatch()
  const loggedInUser = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()
  const { palette } = useTheme()
  const dark = palette.neutral.dark
  const medium = palette.neutral.medium
  const main = palette.neutral.main
  const pLight = palette.primary.light

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

  const handleGoToProfile = () => {
    if (!userId) return
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
    return null
  }

  const displayUrl = url || user.picturePath || ""
  const friendCount = Array.isArray(user.friends) ? user.friends.length : 0

  const activeSocials = SOCIAL_NETWORKS.filter(({ key }) => Boolean((user[key] || "").trim())).map(
    ({ key, label }) => ({
      key,
      label,
      handle: (user[key] || "").trim(),
      href: socialProfileUrl(key, user[key]),
    })
  )

  return (
    <WidgetWrapper>
      <FlexBetween sx={{ gap: "0.5rem", pb: "1.1rem" }}>
        <FlexBetween onClick={handleGoToProfile} sx={{ gap: "1rem", cursor: "pointer" }}>
          <UserImage image={displayUrl} name={`${user.firstName} ${user.lastName}`} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                color: dark,
                fontWeight: "500",
                "&:hover": {
                  color: palette.primary.light,
                },
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            <Typography sx={{ color: medium }}>{friendCount} friends</Typography>
          </Box>
        </FlexBetween>
        {isOwnProfile ? (
          <Tooltip title="Edit profile">
            <IconButton
              sx={{ p: "0.6rem" }}
              onClick={() => setEditOpen(true)}
              aria-label="Edit profile"
            >
              <ManageAccountsOutlined />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={isFriend ? "Remove friend" : "Add friend"}>
            <IconButton
              sx={{ backgroundColor: pLight, p: "0.6rem" }}
              onClick={patchFriend}
              aria-label={isFriend ? "Remove friend" : "Add friend"}
            >
              {isFriend ? <PersonRemoveOutlined /> : <PersonAddOutlined />}
            </IconButton>
          </Tooltip>
        )}
      </FlexBetween>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem", mb: "0.5rem" }}>
          <LocationOnOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user.location?.trim() || "—"}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <WorkOutlineOutlined sx={{ fontSize: "large", color: main }} />
          <Typography sx={{ color: medium }}>{user.occupation?.trim() || "—"}</Typography>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: "1rem 0" }}>
        <FlexBetween>
          <Typography sx={{ color: medium }}>Profile visits</Typography>
          <Typography sx={{ color: main, fontWeight: "500" }}>{user.viewedProfile || 0}</Typography>
        </FlexBetween>
      </Box>

      {activeSocials.length > 0 ? (
        <>
          <Divider />
          <Box sx={{ p: "1rem 0" }}>
            <Typography sx={{ color: main, mb: "1rem", fontSize: "1rem", fontWeight: "500" }}>
              Social Profiles
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeSocials.map(item =>
                item.href ? (
                  <FlexBetween key={item.key} sx={{ gap: "1rem" }}>
                    <FlexBetween sx={{ gap: "1rem", minWidth: 0 }}>
                      <Box sx={{ color: main, display: "flex" }} aria-hidden>
                        {SOCIAL_ICONS[item.key]}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: main, fontWeight: "500" }}>{item.label}</Typography>
                        <Link
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="hover"
                          sx={{ color: medium, fontWeight: 500 }}
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
