"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import {
  alpha,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import type { PaginatedPeople, PeopleListTab } from "@/types/models"
import { friendIdOf } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import { PeopleListSkeleton, PeopleRowSkeleton } from "./skeletons"

const PAGE_LIMIT = 20

const TAB_META: Record<
  PeopleListTab,
  { label: string; emptyTitle: string; emptyOwn: string; emptyOther: string }
> = {
  friends: {
    label: "Friends",
    emptyTitle: "No friends yet",
    emptyOwn: "Send a friend request from Home → Add people, or visit a profile.",
    emptyOther: "This person hasn’t added any friends yet.",
  },
  followers: {
    label: "Followers",
    emptyTitle: "No followers yet",
    emptyOwn: "When someone follows you, they’ll show up here.",
    emptyOther: "No one follows this person yet.",
  },
  following: {
    label: "Following",
    emptyTitle: "Not following anyone",
    emptyOwn: "Follow people to see their posts in your Following feed.",
    emptyOther: "This person isn’t following anyone yet.",
  },
}

type PeopleListModalProps = {
  open: boolean
  onClose: () => void
  userId: string
  initialTab: PeopleListTab
  isOwnProfile: boolean
  /** Refresh profile counts after a relationship change in a row. */
  onRelationshipChanged?: () => void
}

function pathForTab(userId: string, tab: PeopleListTab): string {
  return `/users/${userId}/${tab}`
}

const PeopleListModal = ({
  open,
  onClose,
  userId,
  initialTab,
  isOwnProfile,
  onRelationshipChanged,
}: PeopleListModalProps) => {
  const theme = useTheme()
  const router = useRouter()
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"))
  const dark = theme.palette.neutral.dark
  const isDark = theme.palette.mode === "dark"

  const [tab, setTab] = useState<PeopleListTab>(initialTab)
  const [people, setPeople] = useState<PaginatedPeople["users"]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [listVersion, setListVersion] = useState(0)

  const scrollRootRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreRef = useRef(false)

  const loadFirstPage = useCallback(
    async (activeTab: PeopleListTab) => {
      if (!userId) return
      setLoading(true)
      setError(undefined)
      setPeople([])
      setNextCursor(null)
      setHasMore(false)
      try {
        const { data } = await api.get<PaginatedPeople>(pathForTab(userId, activeTab), {
          params: { limit: PAGE_LIMIT },
        })
        setPeople(Array.isArray(data.users) ? data.users : [])
        setNextCursor(data.nextCursor ?? null)
        setHasMore(Boolean(data.hasMore))
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load people"))
        setPeople([])
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  // Load only the active tab (parent remounts with the correct initialTab on chip open).
  useEffect(() => {
    if (!open || !userId) return
    void loadFirstPage(tab)
  }, [open, userId, tab, listVersion, loadFirstPage])

  const loadMore = useCallback(async () => {
    if (!userId || !hasMore || !nextCursor || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const { data } = await api.get<PaginatedPeople>(pathForTab(userId, tab), {
        params: { limit: PAGE_LIMIT, cursor: nextCursor },
      })
      const next = Array.isArray(data.users) ? data.users : []
      setPeople(prev => {
        const seen = new Set(prev.map(p => String(p._id)))
        return [...prev, ...next.filter(p => !seen.has(String(p._id)))]
      })
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load more"))
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [userId, tab, hasMore, nextCursor])

  useEffect(() => {
    if (!open || !hasMore || loading) return
    const root = scrollRootRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          void loadMore()
        }
      },
      { root, rootMargin: "120px", threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [open, hasMore, loading, people.length, loadMore])

  const handleRelationshipChanged = () => {
    onRelationshipChanged?.()
    setListVersion(v => v + 1)
  }

  const meta = TAB_META[tab]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth="xs"
      aria-labelledby="people-list-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : 1,
            overflow: "hidden",
            backgroundImage: "none",
            border: fullScreen ? "none" : `1px solid ${theme.palette.divider}`,
            boxShadow: isDark
              ? `0 18px 48px ${alpha(theme.palette.common.black, 0.45)}`
              : `0 18px 48px ${alpha(theme.palette.common.black, 0.12)}`,
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          pt: 1.5,
          pb: 0.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          id="people-list-dialog-title"
          component="h2"
          sx={{ flex: 1, fontWeight: 700, fontSize: "1.05rem", color: dark }}
        >
          Connections
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close"
          size="small"
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            color: dark,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, value: PeopleListTab) => setTab(value)}
        variant="fullWidth"
        aria-label="Friends, followers, and following"
        sx={{
          minHeight: 44,
          borderBottom: `1px solid ${theme.palette.divider}`,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            fontSize: "0.875rem",
          },
        }}
      >
        <Tab value="friends" label="Friends" />
        <Tab value="followers" label="Followers" />
        <Tab value="following" label="Following" />
      </Tabs>

      <DialogContent
        ref={scrollRootRef}
        sx={{
          px: 1.5,
          py: 1.5,
          minHeight: fullScreen ? undefined : 200,
          height: fullScreen ? "100%" : "min(62dvh, 440px)",
          overflowY: "auto",
        }}
      >
        {loading ? (
          <PeopleListSkeleton count={6} />
        ) : error && people.length === 0 ? (
          <Typography sx={{ color: "error.main", textAlign: "center", py: 4 }} role="alert">
            {error}
          </Typography>
        ) : people.length === 0 ? (
          <EmptyState
            title={meta.emptyTitle}
            description={isOwnProfile ? meta.emptyOwn : meta.emptyOther}
            actionLabel={isOwnProfile && tab !== "followers" ? "Go to Home" : undefined}
            onAction={isOwnProfile && tab !== "followers" ? () => {
              onClose()
              router.push("/home")
            } : undefined}
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
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
                  avatarSize="40px"
                  showFriendButton
                  relationship={person.relationship}
                  listHover
                  onRelationshipChanged={handleRelationshipChanged}
                  onBeforeNavigate={onClose}
                />
              )
            })}
            <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden />
            {loadingMore ? (
              <Box role="status" aria-label="Loading more people">
                <PeopleRowSkeleton />
                <PeopleRowSkeleton />
              </Box>
            ) : null}
            {error ? (
              <Typography sx={{ color: "error.main", fontSize: "0.8125rem", mt: 1 }} role="alert">
                {error}
              </Typography>
            ) : null}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PeopleListModal
