"use client"

import React, { useEffect, useState } from "react"
import { Box, CircularProgress, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { setPosts } from "@/state"
import type { Post } from "@/types/models"

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

function resolveList(list: PostsListKind | undefined, isProfile: boolean): PostsListKind {
  if (list) return list
  return isProfile ? "authored" : "feed"
}

function pathForList(kind: PostsListKind, userId: string): string {
  switch (kind) {
    case "feed":
      return "/posts"
    case "authored":
      return `/posts/${userId}/posts`
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
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadKey = kind === "authored" ? `authored:${userId}` : kind

  useEffect(() => {
    if (kind === "authored" && !userId) return

    let cancelled = false
    void (async () => {
      try {
        setLoading(true)
        const path = pathForList(kind, userId)
        const { data } = await api.get<Post[]>(path)
        if (cancelled) return
        dispatch(setPosts({ posts: data }))
        setLoadedFor(loadKey)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [kind, userId, loadKey, dispatch])

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
    </Box>
  )
}

export default PostsWidget
