"use client"

import React, { useEffect, useState } from "react"
import { Box, Typography, useTheme } from "@mui/material"

import { api } from "@/lib/api"
import { setPosts } from "@/state"
import type { Post } from "@/types/models"

import { useAppDispatch, useAppSelector } from "../app/hooks"

import PostWidget from "./PostWidget"

type PostsWidgetProps = {
  isProfile: boolean
  userId: string
}

const PostsWidget = ({ isProfile = false, userId }: PostsWidgetProps) => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(state => state.posts)
  const theme = useTheme()
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  const loadKey = isProfile ? `profile:${userId}` : "feed"

  useEffect(() => {
    if (isProfile && !userId) return
    let cancelled = false
    void (async () => {
      const path = isProfile ? `/posts/${userId}/posts` : "/posts"
      const { data } = await api.get<Post[]>(path)
      if (cancelled) return
      dispatch(setPosts({ posts: data }))
      setLoadedFor(loadKey)
    })()
    return () => {
      cancelled = true
    }
  }, [isProfile, userId, loadKey, dispatch])

  if (loadedFor !== loadKey) {
    return null
  }

  if (!posts.length) {
    return (
      <Typography sx={{ color: theme.palette.neutral.medium, textAlign: "center", py: 2 }}>
        {isProfile ? "No posts yet." : "No posts in the feed yet."}
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
