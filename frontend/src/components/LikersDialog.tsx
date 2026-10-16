"use client"

import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { sameUserId } from "@/types/models"

import UserImage from "./UserImage"

export type Liker = {
  _id: string
  firstName: string
  lastName: string
  picturePath?: string
}

type LikersPageResponse = {
  likers: Liker[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

type LikersDialogProps = {
  open: boolean
  onClose: () => void
  /** Authenticated GET path returning a paginated `{ likers, page, limit, total, hasMore }`. */
  fetchPath: string | null
  title?: string
  /** Page size for each request (default 20). */
  pageSize?: number
}

type LikersListProps = {
  fetchPath: string
  pageSize: number
  onSelectUser: (userId: string) => void
}

const LikersList = ({ fetchPath, pageSize, onSelectUser }: LikersListProps) => {
  const theme = useTheme()
  const medium = theme.palette.neutral.medium

  const [likers, setLikers] = useState<Liker[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const { data } = await api.get<LikersPageResponse>(fetchPath, {
          params: { page: 1, limit: pageSize },
        })
        if (cancelled) return
        const nextLikers = Array.isArray(data.likers) ? data.likers : []
        setLikers(nextLikers)
        setPage(data.page ?? 1)
        setHasMore(Boolean(data.hasMore))
        setTotal(typeof data.total === "number" ? data.total : nextLikers.length)
        setError(undefined)
      } catch (err: unknown) {
        if (cancelled) return
        setError(getErrorMessage(err, "Failed to load likes"))
        setLikers([])
        setHasMore(false)
        setTotal(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [fetchPath, pageSize])

  const loadMore = async () => {
    try {
      setLoadingMore(true)
      setError(undefined)
      const nextPage = page + 1
      const { data } = await api.get<LikersPageResponse>(fetchPath, {
        params: { page: nextPage, limit: pageSize },
      })
      const nextLikers = Array.isArray(data.likers) ? data.likers : []
      setLikers(prev => [...prev, ...nextLikers])
      setPage(data.page ?? nextPage)
      setHasMore(Boolean(data.hasMore))
      if (typeof data.total === "number") setTotal(data.total)
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load more likes"))
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }} role="status" aria-live="polite">
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (error && likers.length === 0) {
    return (
      <Typography sx={{ color: "error.main", px: 2, py: 2 }} role="alert">
        {error}
      </Typography>
    )
  }

  if (likers.length === 0) {
    return <Typography sx={{ color: medium, px: 2, py: 2 }}>No likes yet</Typography>
  }

  return (
    <>
      {total > 0 && (
        <Typography sx={{ color: medium, px: 2, pb: 1, fontSize: "0.8125rem" }}>{total} likes</Typography>
      )}
      <List disablePadding>
        {likers.map(liker => {
          const name = [liker.firstName, liker.lastName].filter(Boolean).join(" ").trim() || "User"
          return (
            <ListItemButton key={liker._id} onClick={() => onSelectUser(liker._id)} sx={{ borderRadius: 1 }}>
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <UserImage image={liker.picturePath || ""} name={name} size="40px" />
              </ListItemAvatar>
              <ListItemText
                primary={name}
                slotProps={{ primary: { sx: { fontWeight: 500, fontSize: "0.9375rem" } } }}
              />
            </ListItemButton>
          )
        })}
      </List>

      {error && (
        <Typography sx={{ color: "error.main", px: 2, py: 1, fontSize: "0.8125rem" }} role="alert">
          {error}
        </Typography>
      )}

      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
          <Button onClick={() => void loadMore()} disabled={loadingMore} size="small">
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </Box>
      )}
    </>
  )
}

const LikersDialog = ({
  open,
  onClose,
  fetchPath,
  title = "Liked by",
  pageSize = 20,
}: LikersDialogProps) => {
  const router = useRouter()
  const currentUserId = useAppSelector(state => state.user?._id)

  const goToProfile = (userId: string) => {
    onClose()
    if (sameUserId(currentUserId, userId)) {
      router.push("/profile")
    } else {
      router.push(`/profile/${userId}`)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 120, px: 1 }}>
        {open && fetchPath ? (
          <LikersList
            key={fetchPath}
            fetchPath={fetchPath}
            pageSize={pageSize}
            onSelectUser={goToProfile}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export default LikersDialog
