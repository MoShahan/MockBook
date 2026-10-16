"use client"

import { useCallback, useEffect, useState } from "react"
import { Notifications } from "@mui/icons-material"
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { sameUserId } from "@/types/models"
import type { AppNotification } from "@/types/notifications"

function notificationCopy(n: AppNotification): string {
  const name = `${n.actor?.firstName || ""} ${n.actor?.lastName || ""}`.trim() || "Someone"
  switch (n.type) {
    case "post_like":
      return `${name} liked your post`
    case "comment":
      return `${name} commented on your post`
    case "comment_like":
      return `${name} liked your comment`
    case "friend":
      return `${name} added you as a friend`
    default:
      return `${name} interacted with you`
  }
}

const NotificationsMenu = () => {
  const theme = useTheme()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [items, setItems] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const open = Boolean(anchorEl)

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get<{ count: number }>("/notifications/unread-count")
      setUnread(data.count || 0)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    // Defer initial fetch so we don't sync-setState inside the effect body.
    const boot = window.setTimeout(() => void refreshUnread(), 0)
    const id = window.setInterval(() => void refreshUnread(), 60_000)
    return () => {
      window.clearTimeout(boot)
      window.clearInterval(id)
    }
  }, [refreshUnread])

  const loadList = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ notifications: AppNotification[] }>("/notifications?limit=20")
      setItems(data.notifications || [])
      await refreshUnread()
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
    await loadList()
  }

  const handleClose = () => setAnchorEl(null)

  const handleMarkAll = async () => {
    await api.patch("/notifications/read-all")
    setItems(prev => prev.map(n => ({ ...n, read: true })))
    setUnread(0)
  }

  const handleClickItem = async (n: AppNotification) => {
    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`)
        setItems(prev => prev.map(x => (sameUserId(x._id, n._id) ? { ...x, read: true } : x)))
        setUnread(c => Math.max(0, c - 1))
      } catch {
        // ignore
      }
    }
    handleClose()
    if (n.postId) {
      router.push(`/post/${n.postId}`)
    } else if (n.actor?._id) {
      router.push(`/profile/${n.actor._id}`)
    }
  }

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Notifications" aria-haspopup="true">
        <Badge badgeContent={unread} color="primary" max={99}>
          <Notifications sx={{ fontSize: "25px" }} />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: { width: 340, maxWidth: "90vw", maxHeight: 420 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Button size="small" onClick={handleMarkAll} disabled={!unread}>
            Mark all read
          </Button>
        </Box>
        <Divider />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : !items.length ? (
          <Typography sx={{ px: 2, py: 2, color: theme.palette.neutral.medium }}>
            No notifications yet.
          </Typography>
        ) : (
          <List dense disablePadding>
            {items.map(n => (
              <ListItemButton
                key={n._id}
                onClick={() => void handleClickItem(n)}
                sx={{
                  bgcolor: n.read ? undefined : theme.palette.action.hover,
                  alignItems: "flex-start",
                }}
              >
                <ListItemText
                  primary={notificationCopy(n)}
                  secondary={n.createdAt ? new Date(n.createdAt).toLocaleString() : undefined}
                  slotProps={{
                    primary: { sx: { fontSize: "0.9rem" } },
                    secondary: { sx: { fontSize: "0.75rem" } },
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Menu>
    </>
  )
}

export default NotificationsMenu
