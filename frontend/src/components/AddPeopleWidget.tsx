"use client"

import { useEffect, useState } from "react"
import { Box, CircularProgress, TextField, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import type { DiscoverUser } from "@/types/models"

import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

const DEBOUNCE_MS = 300

const AddPeopleWidget = () => {
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

  return (
    <WidgetWrapper sx={{ overflow: "hidden" }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: "500", color: theme.palette.neutral.dark, mb: "1rem" }}
      >
        Add people
      </Typography>
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
        <Typography sx={{ color: theme.palette.neutral.medium }}>
          {debounced ? "No users found" : "No people to show yet."}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%", minWidth: 0 }}>
          {users.map(u => (
            <Friend
              key={u._id}
              id={u._id}
              name={`${u.firstName} ${u.lastName}`}
              subtitle={u.occupation || u.location || ""}
              url={u.picturePath || ""}
              showFriendButton
            />
          ))}
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default AddPeopleWidget
