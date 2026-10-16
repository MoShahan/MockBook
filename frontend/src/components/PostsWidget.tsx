"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { appendPosts, setPosts } from "@/state"
import type { PaginatedPosts, Post } from "@/types/models"

import { useAppDispatch, useAppSelector } from "../app/hooks"

import PostWidget from "./PostWidget"

/** Which post list to load. */
export type PostsListKind = "feed" | "authored" | "saved" | "liked" | "commented"

type PostsWidgetProps = {
  list?: PostsListKind
  /** Required for `authored` (and legacy `isProfile`). */
  userId?: string
  /** @deprecated Prefer `list="authored"`. */
  isProfile?: boolean
}

const EMPTY_COPY: Record<PostsListKind, string> = {
  feed: "No posts in the feed yet.",
  authored: "No posts yet.",
  saved: "No saved posts yet.",
  liked: "No liked posts yet.",
  commented: "No commented posts yet.",
}

const PAGE_LIMIT = 10

function resolveList(list: PostsListKind | undefined, isProfile: boolean): PostsListKind {
  if (list) return list
  return isProfile ? "authored" : "feed"
}

function usesCursorPagination(kind: PostsListKind): boolean {
  return kind === "feed" || kind === "authored"
}

function pathForList(kind: PostsListKind, userId: string, cursor?: string | null): string {
  const params = new URLSearchParams({ limit: String(PAGE_LIMIT) })
  if (cursor) params.set("cursor", cursor)

  switch (kind) {
    case "feed":
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }} role="status" aria-live="polite">
        <CircularProgress size={32} />
      </Box>
    )
  }

  if (!posts.length) {
    return (
      <Typography sx={{ color: theme.palette.neutral.medium, textAlign: "center", py: 2 }}>
        {EMPTY_COPY[kind]}
      </Typography>
    )
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
