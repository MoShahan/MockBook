"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Box, Button, TextField, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { formatJoinedDate } from "@/lib/time"
import type { DiscoverUser } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import { PeopleListSkeleton, PeopleRowSkeleton } from "./skeletons"
import WidgetWrapper from "./WidgetWrapper"

const DEBOUNCE_MS = 300
const PAGE_LIMIT = 10

type DiscoverPage = {
  users: DiscoverUser[]
  nextCursor: string | null
  hasMore: boolean
}

type AddPeopleWidgetProps = {
  /** When embedded (e.g. mobile accordion), skip outer card chrome + title. */
  embedded?: boolean
  /** Hide the in-widget title when the page already provides a heading. */
  showTitle?: boolean
  /**
   * `pages` - show at most 10 with Previous/Next (home rail).
   * `infinite` - append pages as you scroll (/people page).
   */
  mode?: "pages" | "infinite"
}

const AddPeopleWidget = ({
  embedded = false,
  showTitle = true,
  mode = "pages",
}: AddPeopleWidgetProps) => {
  const theme = useTheme()
  const infinite = mode === "infinite"

  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [users, setUsers] = useState<DiscoverUser[]>([])
  /** `cursors[i]` is the `cursor` query used to fetch page `i` (`null` = first page). */
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [retryTick, setRetryTick] = useState(0)

  const loadingMoreRef = useRef(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [query])

  const loadPaged = useCallback(async (index: number, search: string, pageCursors: (string | null)[]) => {
    setLoading(true)
    setError(undefined)
    try {
      const cursor = pageCursors[index] ?? null
      const { data } = await api.get<DiscoverPage>("/users/discover", {
        params: {
          limit: PAGE_LIMIT,
          ...(cursor ? { cursor } : {}),
          ...(search ? { q: search } : {}),
        },
      })
      const pageUsers = Array.isArray(data.users) ? data.users.slice(0, PAGE_LIMIT) : []
      setUsers(pageUsers)
      setHasMore(Boolean(data.hasMore))
      setPageIndex(index)

      if (data.nextCursor) {
        setCursors(prev => {
          const next = prev.slice(0, index + 1)
          next[index + 1] = data.nextCursor
          return next
        })
      } else {
        setCursors(prev => prev.slice(0, index + 1))
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load people"))
      setUsers([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const requestKey = `${infinite ? "infinite" : "pages"}:${debounced}:${retryTick}`
  const [appliedKey, setAppliedKey] = useState(requestKey)
  if (appliedKey !== requestKey) {
    setAppliedKey(requestKey)
    setUsers([])
    setCursors([null])
    setPageIndex(0)
    setNextCursor(null)
    setHasMore(false)
    setError(undefined)
    setLoading(true)
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const { data } = await api.get<DiscoverPage>("/users/discover", {
          params: { limit: PAGE_LIMIT, ...(debounced ? { q: debounced } : {}) },
        })
        if (cancelled) return
        if (infinite) {
          setUsers(Array.isArray(data.users) ? data.users : [])
          setNextCursor(data.nextCursor ?? null)
          setHasMore(Boolean(data.hasMore))
        } else {
          const pageUsers = Array.isArray(data.users) ? data.users.slice(0, PAGE_LIMIT) : []
          setUsers(pageUsers)
          setHasMore(Boolean(data.hasMore))
          setPageIndex(0)
          setCursors(data.nextCursor ? [null, data.nextCursor] : [null])
        }
      } catch (err: unknown) {
        if (cancelled) return
        setError(getErrorMessage(err, "Failed to load people"))
        setUsers([])
        setHasMore(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced, infinite, retryTick])

  const loadMoreInfinite = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMoreRef.current || loading) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const { data } = await api.get<DiscoverPage>("/users/discover", {
        params: {
          limit: PAGE_LIMIT,
          cursor: nextCursor,
          ...(debounced ? { q: debounced } : {}),
        },
      })
      const next = Array.isArray(data.users) ? data.users : []
      setUsers(prev => {
        const seen = new Set(prev.map(u => String(u._id)))
        return [...prev, ...next.filter(u => !seen.has(String(u._id)))]
      })
      setNextCursor(data.nextCursor ?? null)
      setHasMore(Boolean(data.hasMore))
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to load more people"))
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore, nextCursor, loading, debounced])

  useEffect(() => {
    if (!infinite || !hasMore || loading) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          void loadMoreInfinite()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [infinite, hasMore, loading, users.length, loadMoreInfinite])

  const goPrev = () => {
    if (pageIndex <= 0 || loading) return
    void loadPaged(pageIndex - 1, debounced, cursors)
  }

  const goNext = () => {
    if (!hasMore || loading) return
    const nextIndex = pageIndex + 1
    if (cursors[nextIndex] == null) return
    void loadPaged(nextIndex, debounced, cursors)
  }

  const body = (
    <>
      {!embedded && showTitle ? (
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: theme.palette.neutral.dark, mb: "0.75rem" }}
        >
          Add people
        </Typography>
      ) : null}
      <TextField
        size="small"
        fullWidth
        placeholder="Search by name"
        value={query}
        onChange={e => setQuery(e.target.value)}
        slotProps={{ htmlInput: { "aria-label": "Search people" } }}
        sx={{ mb: "0.75rem" }}
      />
      {loading ? (
        <PeopleListSkeleton count={5} />
      ) : error && users.length === 0 ? (
        <EmptyState
          title="Couldn’t load people"
          description={error}
          actionLabel="Try again"
          onAction={() => setRetryTick(n => n + 1)}
        />
      ) : !users.length ? (
        <EmptyState
          title={debounced ? "No matches" : "No people to show"}
          description={
            debounced
              ? "Try a different name, or clear the search to browse recent users."
              : "When others join Xivi, you’ll see them here."
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "0.35rem", width: "100%", minWidth: 0 }}>
          {users.map(u => {
            const joined = formatJoinedDate(u.createdAt)
            const roleLine = u.occupation || u.location || ""
            const subtitle = [roleLine, joined].filter(Boolean).join(" · ")
            return (
              <Friend
                key={u._id}
                id={u._id}
                name={`${u.firstName} ${u.lastName}`}
                subtitle={subtitle}
                url={u.picturePath || ""}
                avatarColor={u.avatarColor}
                showFriendButton
                relationship={u.relationship}
                listHover
              />
            )
          })}
          {infinite ? (
            <>
              {hasMore ? <Box ref={sentinelRef} sx={{ height: 1 }} aria-hidden /> : null}
              {loadingMore ? (
                <Box role="status" aria-label="Loading more people">
                  <PeopleRowSkeleton />
                  <PeopleRowSkeleton />
                </Box>
              ) : null}
            </>
          ) : (pageIndex > 0 || hasMore) ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                pt: 1,
                mt: 0.5,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Button
                size="small"
                onClick={goPrev}
                disabled={pageIndex <= 0 || loading}
                sx={{ textTransform: "none", fontWeight: 600, minWidth: 0 }}
              >
                Previous
              </Button>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                Page {pageIndex + 1}
              </Typography>
              <Button
                size="small"
                onClick={goNext}
                disabled={!hasMore || loading || cursors[pageIndex + 1] == null}
                sx={{ textTransform: "none", fontWeight: 600, minWidth: 0 }}
              >
                Next
              </Button>
            </Box>
          ) : null}
          {error ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                mt: 0.5,
              }}
            >
              <Typography sx={{ color: "error.main", fontSize: "0.8125rem" }} role="alert">
                {error}
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  setError(undefined)
                  if (infinite) void loadMoreInfinite()
                  else void loadPaged(pageIndex, debounced, cursors)
                }}
                sx={{ textTransform: "none", fontWeight: 600, flexShrink: 0 }}
              >
                Retry
              </Button>
            </Box>
          ) : null}
        </Box>
      )}
    </>
  )

  if (embedded) {
    return (
      <Box data-tour="add-people" sx={{ px: 2, pb: 2 }}>
        {body}
      </Box>
    )
  }

  return (
    <WidgetWrapper data-tour="add-people" sx={{ overflow: "hidden" }}>
      {body}
    </WidgetWrapper>
  )
}

export default AddPeopleWidget
