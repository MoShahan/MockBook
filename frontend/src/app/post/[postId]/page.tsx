"use client"

import React, { use, useEffect, useState } from "react"
import { Box, Button, CircularProgress, Typography, useTheme } from "@mui/material"
import axios from "axios"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import Navbar from "@/components/Navbar"
import PostWidget from "@/components/PostWidget"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { setPost } from "@/state"
import type { Post } from "@/types/models"

type PostPageProps = {
  params: Promise<{ postId: string }>
}

type LoadStatus = "loading" | "ready" | "notfound" | "error"

const PostPage = ({ params }: PostPageProps) => {
  const { postId } = use(params)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const theme = useTheme()
  const accessToken = useAppSelector(state => state.accessToken)
  const post = useAppSelector(state => state.posts.find(p => String(p._id) === String(postId)))

  const [status, setStatus] = useState<LoadStatus>("loading")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!accessToken || !postId) return

    let cancelled = false
    void (async () => {
      try {
        setStatus("loading")
        setErrorMsg("")
        const { data } = await api.get<Post>(`/posts/${postId}`)
        if (cancelled) return
        dispatch(setPost({ post: data }))
        setStatus("ready")
      } catch (err: unknown) {
        if (cancelled) return
        const statusCode = axios.isAxiosError(err) ? err.response?.status : undefined
        if (statusCode === 404 || statusCode === 400) {
          setStatus("notfound")
        } else {
          setStatus("error")
          setErrorMsg(getErrorMessage(err, "Failed to load post"))
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [postId, accessToken, dispatch])

  return (
    <Box>
      <Navbar />
      <Box
        sx={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto",
          padding: "2rem 6%",
        }}
      >
        {status === "loading" && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }} role="status" aria-live="polite">
            <CircularProgress size={36} />
          </Box>
        )}

        {status === "notfound" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: theme.palette.neutral.medium, mb: 2 }}>Post not found.</Typography>
            <Button onClick={() => router.push("/home")} variant="contained">
              Back to home
            </Button>
          </Box>
        )}

        {status === "error" && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "error.main", mb: 2 }} role="alert">
              {errorMsg || "Something went wrong."}
            </Typography>
            <Button onClick={() => router.push("/home")} variant="outlined">
              Back to home
            </Button>
          </Box>
        )}

        {status === "ready" && post && (
          <PostWidget post={post} onDeleted={() => router.push("/home")} />
        )}
      </Box>
    </Box>
  )
}

export default PostPage
