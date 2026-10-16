"use client"

import { useEffect, useState } from "react"
import { Box, CircularProgress, TextField, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import type { DiscoverUser } from "@/types/models"

import EmptyState from "./EmptyState"
import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

const DEBOUNCE_MS = 300

type AddPeopleWidgetProps = {
  /** When embedded (e.g. mobile accordion), skip outer card chrome + title. */
  embedded?: boolean
}

const AddPeopleWidget = ({ embedded = false }: AddPeopleWidgetProps) => {
  const theme = useTheme()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [users, setUsers] = useState<DiscoverUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({ limit: "10" })
        if (debounced) params.set("q", debounced)
        const { data } = await api.get<{ users: DiscoverUser[] }>(`/users/discover?${params}`)
        if (!cancelled) setUsers(data.users || [])
      } catch {
        if (!cancelled) setUsers([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced])

  const body = (
    <>
      {!embedded ? (
        <Typography
          variant="h5"
          sx={{ fontWeight: "500", color: theme.palette.neutral.dark, mb: "1rem" }}
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
        sx={{ mb: "1rem" }}
      />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }} role="status">
          <CircularProgress size={28} />
        </Box>
      ) : !users.length ? (
        <EmptyState
          title={debounced ? "No matches" : "No people to show"}
          description={
            debounced
              ? "Try a different name, or clear the search to browse recent users."
              : "When others join MockBook, you’ll see them here."
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", minWidth: 0 }}>
          {users.map(u => (
            <Friend
              key={u._id}
              id={u._id}
              name={`${u.firstName} ${u.lastName}`}
              subtitle={u.occupation || u.location || ""}
              url={u.picturePath || ""}
              avatarColor={u.avatarColor}
              showFriendButton
            />
          ))}
        </Box>
      )}
    </>
  )

  if (embedded) {
    return <Box sx={{ px: 2, pb: 2 }}>{body}</Box>
  }

  return <WidgetWrapper sx={{ overflow: "hidden" }}>{body}</WidgetWrapper>
}

export default AddPeopleWidget
