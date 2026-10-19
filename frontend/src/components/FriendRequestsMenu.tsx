"use client"

import { type MouseEvent, type ReactNode,useCallback, useEffect, useState } from "react"
import { PersonAddAlt1 } from "@mui/icons-material"
import {
  alpha,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch } from "@/app/hooks"
import { PeopleListSkeleton } from "@/components/skeletons"
import UserImage from "@/components/UserImage"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/providers/ToastProvider"
import { setFriends } from "@/state"
import type { Friend } from "@/types/models"
import type { FriendRequestItem } from "@/types/relationships"

const FriendRequestsMenu = () => {
  const theme = useTheme()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { success, error: toastError } = useToast()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [items, setItems] = useState<FriendRequestItem[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  const open = Boolean(anchorEl)

  const refreshCount = useCallback(async () => {
    try {
      const { data } = await api.get<{ count: number }>("/users/me/friend-requests/count")
      setCount(data.count || 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const boot = window.setTimeout(() => void refreshCount(), 0)
    const id = window.setInterval(() => void refreshCount(), 60_000)
    return () => {
      window.clearTimeout(boot)
      window.clearInterval(id)
    }
  }, [refreshCount])

  const loadIncoming = async () => {
    try {
      setLoading(true)
      const { data } = await api.get<{ requests: FriendRequestItem[] }>(
        "/users/me/friend-requests?box=incoming"
      )
      setItems(data.requests || [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
    void loadIncoming()
    void refreshCount()
  }

  const handleClose = () => setAnchorEl(null)

  const accept = async (requestId: string) => {
    try {
      setBusyId(requestId)
      const { data } = await api.post<{ friends: Friend[]; message: string }>(
        `/users/me/friend-requests/${requestId}/accept`
      )
      dispatch(setFriends({ friends: data.friends }))
      success(data.message || "Friend request accepted")
      setItems(prev => prev.filter(r => r._id !== requestId))
      void refreshCount()
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
      void refreshCount()
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Could not decline request"))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <TooltipWrap count={count}>
        <IconButton
          onClick={handleOpen}
          aria-label="Friend requests"
          aria-haspopup="true"
          aria-expanded={open}
        >
          <Badge
            color="error"
            badgeContent={count}
            max={9}
            overlap="circular"
            sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}
          >
            <PersonAddAlt1 sx={{ fontSize: "25px" }} />
          </Badge>
        </IconButton>
      </TooltipWrap>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: "92vw",
              mt: 1,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700 }}>Friend requests</Typography>
          <Button
            size="small"
            onClick={() => {
              handleClose()
              router.push("/friend-requests")
            }}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            See all
          </Button>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ px: 1, py: 0.5 }}>
            <PeopleListSkeleton count={3} />
          </Box>
        ) : items.length === 0 ? (
          <Typography sx={{ px: 2, py: 2.5, color: "text.secondary", fontSize: "0.9rem" }}>
            No pending friend requests.
          </Typography>
        ) : (
          <List disablePadding sx={{ maxHeight: 360, overflow: "auto" }}>
            {items.map(req => {
              const name =
                `${req.user?.firstName || ""} ${req.user?.lastName || ""}`.trim() || "Someone"
              return (
                <ListItemButton
                  key={req._id}
                  alignItems="flex-start"
                  sx={{
                    py: 1.1,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                  onClick={() => {
                    if (req.user?._id) {
                      handleClose()
                      router.push(`/profile/${req.user._id}`)
                    }
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 48 }}>
                    <UserImage
                      image={req.user?.picturePath || ""}
                      name={name}
                      size="40px"
                      bgColor={req.user?.avatarColor}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={name}
                    secondary="wants to be friends"
                    slotProps={{
                      primary: { sx: { fontWeight: 600, fontSize: "0.9rem" } },
                      secondary: { sx: { fontSize: "0.8rem" } },
                    }}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5, ml: 1 }}
                    onClick={e => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      disabled={busyId === req._id}
                      onClick={() => void accept(req._id)}
                      sx={{ textTransform: "none", fontWeight: 600, minWidth: 72 }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      disabled={busyId === req._id}
                      onClick={() => void decline(req._id)}
                      sx={{ textTransform: "none", minWidth: 72 }}
                    >
                      Decline
                    </Button>
                  </Box>
                </ListItemButton>
              )
            })}
          </List>
        )}
      </Menu>
    </>
  )
}

function TooltipWrap({ count, children }: { count: number; children: ReactNode }) {
  return (
    <Box component="span" title={count ? `${count} friend request${count === 1 ? "" : "s"}` : "Friend requests"}>
      {children}
    </Box>
  )
}

export default FriendRequestsMenu
