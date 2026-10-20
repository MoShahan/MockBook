"use client"

import { useEffect, useState } from "react"
import { Box, Button, Tab, Tabs, Typography, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch } from "@/app/hooks"
import AppShell from "@/components/AppShell"
import EmptyState from "@/components/EmptyState"
import { segmentedTabsSx } from "@/components/segmentedTabsSx"
import { PeopleListSkeleton } from "@/components/skeletons"
import UserImage from "@/components/UserImage"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend } from "@/types/models"
import type { FriendRequestItem } from "@/types/relationships"

type BoxKind = "incoming" | "outgoing"

const FriendRequestsPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { success, error: toastError } = useToast()
  const [box, setBox] = useState<BoxKind>("incoming")
  const [items, setItems] = useState<FriendRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data } = await api.get<{ requests: FriendRequestItem[] }>(
          `/users/me/friend-requests?box=${box}`
        )
        if (!cancelled) setItems(data.requests || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [box])

  const accept = async (requestId: string) => {
    try {
      setBusyId(requestId)
      const { data } = await api.post<{ friends: Friend[]; message: string }>(
        `/users/me/friend-requests/${requestId}/accept`
      )
      dispatch(setFriends({ friends: data.friends }))
      success(data.message || "Friend request accepted")
      setItems(prev => prev.filter(r => r._id !== requestId))
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Could not accept request"))
    } finally {
      setBusyId(null)
    }
  }

  const decline = async (requestId: string) => {
    try {
      setBusyId(requestId)
      await api.post(`/users/me/friend-requests/${requestId}/decline`)
      success("Friend request declined")
      setItems(prev => prev.filter(r => r._id !== requestId))
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Could not decline request"))
    } finally {
      setBusyId(null)
    }
  }

  const cancel = async (requestId: string) => {
    try {
      setBusyId(requestId)
      await api.delete(`/users/me/friend-requests/${requestId}`)
      success("Friend request cancelled")
      setItems(prev => prev.filter(r => r._id !== requestId))
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Could not cancel request"))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AppShell narrow>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Friend requests
        </Typography>
        <Typography sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}>
          Accept requests to become mutual friends. You can still Follow someone without being
          friends.
        </Typography>

        <Tabs
          value={box}
          onChange={(_, value: BoxKind) => {
            setLoading(true)
            setBox(value)
          }}
          aria-label="Friend request folders"
          sx={{ ...segmentedTabsSx, mb: 2 }}
        >
          <Tab value="incoming" label="Incoming" disableRipple />
          <Tab value="outgoing" label="Outgoing" disableRipple />
        </Tabs>

        {loading ? (
          <PeopleListSkeleton count={5} />
        ) : items.length === 0 ? (
          <EmptyState
            title={box === "incoming" ? "No incoming requests" : "No outgoing requests"}
            description={
              box === "incoming"
                ? "When someone wants to be friends, their request will show up here."
                : "Friend requests you send will appear here until they’re accepted or cancelled."
            }
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {items.map(req => {
              const name =
                `${req.user?.firstName || ""} ${req.user?.lastName || ""}`.trim() || "Someone"
              const profileId = req.user?._id
              return (
                <Box
                  key={req._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    onClick={() => profileId && router.push(`/profile/${profileId}`)}
                    sx={{ cursor: profileId ? "pointer" : "default", flexShrink: 0 }}
                  >
                    <UserImage
                      image={req.user?.picturePath || ""}
                      name={name}
                      size="48px"
                      bgColor={req.user?.avatarColor}
                    />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        cursor: profileId ? "pointer" : "default",
                        "&:hover": profileId ? { color: "primary.main" } : undefined,
                      }}
                      onClick={() => profileId && router.push(`/profile/${profileId}`)}
                    >
                      {name}
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                      {box === "incoming" ? "Wants to be friends" : "Request pending"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.75, flexShrink: 0 }}>
                    {box === "incoming" ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={busyId === req._id}
                          onClick={() => void accept(req._id)}
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          disabled={busyId === req._id}
                          onClick={() => void decline(req._id)}
                          sx={{ textTransform: "none" }}
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        disabled={busyId === req._id}
                        onClick={() => void cancel(req._id)}
                        sx={{ textTransform: "none" }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
    </AppShell>
  )
}

export default FriendRequestsPage
