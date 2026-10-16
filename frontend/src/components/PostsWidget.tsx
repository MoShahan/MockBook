"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { appendPosts, setPosts } from "@/state"
import type { PaginatedPosts, Post } from "@/types/models"

import { useAppDispatch, useAppSelector } from "../app/hooks"

import EmptyState from "./EmptyState"
import PostWidget from "./PostWidget"

/** Which post list to load. */
export type PostsListKind = "feed" | "friends" | "authored" | "saved" | "liked" | "commented"

type PostsWidgetProps = {
  list?: PostsListKind
  /** Required for `authored` (and legacy `isProfile`). */
  userId?: string
  /** @deprecated Prefer `list="authored"`. */
  isProfile?: boolean
}

const EMPTY_COPY: Record<PostsListKind, { title: string; description: string }> = {
  feed: {
    title: "Nothing here yet",
    description: "When people post, their updates will show up in Everyone.",
  },
  friends: {
    title: "No friend posts yet",
    description: "Add people from the right panel, or switch to Everyone to browse the wider feed.",
  },
  authored: {
    title: "No posts yet",
    description: "Share something from Home — it will appear here on this profile.",
  },
  saved: {
    title: "No saved posts",
    description: "Bookmark posts you want to revisit and they’ll collect here.",
  },
  liked: {
    title: "No liked posts",
    description: "Posts you like will show up in this list.",
  },
  commented: {
    title: "No commented posts",
    description: "Posts you’ve commented on will appear here.",
  },
}

const PAGE_LIMIT = 10

function resolveList(list: PostsListKind | undefined, isProfile: boolean): PostsListKind {
  if (list) return list
  return isProfile ? "authored" : "feed"
}

function usesCursorPagination(kind: PostsListKind): boolean {
  return kind === "feed" || kind === "friends" || kind === "authored"
}

function pathForList(kind: PostsListKind, userId: string, cursor?: string | null): string {
  const params = new URLSearchParams({ limit: String(PAGE_LIMIT) })
  if (cursor) params.set("cursor", cursor)

  switch (kind) {
    case "feed":
      params.set("scope", "all")
      return `/posts?${params}`
    case "friends":
      params.set("scope", "friends")
      return `/posts?${params}`
    case "authored":
      return `/posts/${userId}/posts?${params}`
    case "saved":
      return "/posts/saved"
    case "liked":
      return "/posts/liked"
    case "commented":
      return "/posts/commented"
  }
}

const PostsWidget = ({ list, userId = "", isProfile = false }: PostsWidgetProps) => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(state => state.posts)
  const theme = useTheme()
  const kind = resolveList(list, isProfile)
  const paginated = usesCursorPagination(kind)

  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreRef = useRef(false)

  const loadKey = kind === "authored" ? `authored:${userId}` : kind

  useEffect(() => {
    if (kind === "authored" && !userId) return

    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        setLoadError(null)
        setNextCursor(null)
        setHasMore(false)
        const path = pathForList(kind, userId)
        if (paginated) {
          const { data } = await api.get<PaginatedPosts>(path)
          if (cancelled) return
          dispatch(setPosts({ posts: data.posts || [] }))
          setNextCursor(data.nextCursor)
          setHasMore(Boolean(data.hasMore))
        } else {
          const { data } = await api.get<Post[]>(path)
          if (cancelled) return
          dispatch(setPosts({ posts: data }))
          setHasMore(false)
          setNextCursor(null)
        }
        setLoadedFor(loadKey)
      } catch {
        if (!cancelled) {
          setLoadError("Couldn’t load posts. Try refreshing the page.")
          dispatch(setPosts({ posts: [] }))
          setLoadedFor(loadKey)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [kind, userId, loadKey, dispatch, paginated])

  const loadMore = useCallback(async () => {
    if (!paginated || !hasMore || !nextCursor || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    try {
      const path = pathForList(kind, userId, nextCursor)
      const { data } = await api.get<PaginatedPosts>(path)
      dispatch(appendPosts({ posts: data.posts || [] }))
      setNextCursor(data.nextCursor)
      setHasMore(Boolean(data.hasMore))
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [paginated, hasMore, nextCursor, kind, userId, dispatch])

  useEffect(() => {
    if (!paginated || !hasMore) return
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          void loadMore()
        }
      },
      { rootMargin: "240px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [paginated, hasMore, loadMore, loadedFor, posts.length])

  if (loading || loadedFor !== loadKey) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          py: 4,
        }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={32} />
        <Typography sx={{ color: theme.palette.neutral.medium }} variant="body2">
          Loading posts…
        </Typography>
      </Box>
    )
  }

  if (loadError) {
    return <EmptyState title="Something went wrong" description={loadError} />
  }

  if (!posts.length) {
    const copy = EMPTY_COPY[kind]
    return <EmptyState title={copy.title} description={copy.description} />
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {posts.map(post => (
        <PostWidget key={post._id} post={post} />
      ))}
      {paginated && hasMore ? (
        <Box
          ref={sentinelRef}
          sx={{ display: "flex", justifyContent: "center", py: 2 }}
          role="status"
          aria-live="polite"
        >
          {loadingMore ? <CircularProgress size={28} /> : null}
        </Box>
      ) : null}
      {paginated && !hasMore && posts.length > 0 ? (
        <Typography sx={{ color: theme.palette.neutral.medium, textAlign: "center", py: 1 }}>
          You’re all caught up.
        </Typography>
      ) : null}
    </Box>
  )
}

export default PostsWidget
