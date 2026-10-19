"use client"

import { useCallback, useEffect, useState } from "react"
import { Box, Button, TextField, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import type { DiscoverUser } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import { PeopleListSkeleton } from "./skeletons"
import WidgetWrapper from "./WidgetWrapper"

const DEBOUNCE_MS = 300
/** Hard cap: never show more than this many rows at once. */
const PAGE_LIMIT = 10

type DiscoverPage = {
  users: DiscoverUser[]
  nextCursor: string | null
  hasMore: boolean
}

type AddPeopleWidgetProps = {
  /** When embedded (e.g. mobile accordion), skip outer card chrome + title. */
  embedded?: boolean
}

const AddPeopleWidget = ({ embedded = false }: AddPeopleWidgetProps) => {
  const theme = useTheme()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [users, setUsers] = useState<DiscoverUser[]>([])
  /** `cursors[i]` is the `cursor` query used to fetch page `i` (`null` = first page). */
  const [cursors, setCursors] = useState<(string | null)[]>([null])
  const [pageIndex, setPageIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [query])

  const loadPage = useCallback(async (index: number, search: string, pageCursors: (string | null)[]) => {
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

  useEffect(() => {
    setCursors([null])
    setPageIndex(0)
    void loadPage(0, debounced, [null])
  }, [debounced, loadPage])

  const goPrev = () => {
    if (pageIndex <= 0 || loading) return
    void loadPage(pageIndex - 1, debounced, cursors)
  }

  const goNext = () => {
    if (!hasMore || loading) return
    const nextIndex = pageIndex + 1
    if (cursors[nextIndex] == null) return
    void loadPage(nextIndex, debounced, cursors)
  }

  const body = (
    <>
      {!embedded ? (
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
        <Typography sx={{ color: "error.main", fontSize: "0.875rem", py: 1 }} role="alert">
          {error}
        </Typography>
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
          {users.map(u => (
            <Friend
              key={u._id}
              id={u._id}
              name={`${u.firstName} ${u.lastName}`}
              subtitle={u.occupation || u.location || ""}
              url={u.picturePath || ""}
              avatarColor={u.avatarColor}
              showFriendButton
              relationship={u.relationship}
              listHover
            />
          ))}
          {(pageIndex > 0 || hasMore) && (
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
          )}
          {error ? (
            <Typography sx={{ color: "error.main", fontSize: "0.8125rem", mt: 0.5 }} role="alert">
              {error}
            </Typography>
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
