"use client"

import React, { useState } from "react"
import { ChatBubbleOutlineOutlined, FavoriteBorderOutlined, FavoriteOutlined, ShareOutlined } from "@mui/icons-material"
import { Box, Button, Divider, IconButton, InputBase, Typography, useTheme } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api, mediaUrl } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { formatPostTime } from "@/lib/time"
import { setPost } from "@/state"
import type { Post } from "@/types/models"

import FlexBetween from "./FlexBetween"
import Friend from "./Friend"
import WidgetWrapper from "./WidgetWrapper"

type PostWidgetProps = { post: Post }

const PostWidget = ({ post }: PostWidgetProps) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const likes = post.likes ?? {}
  const isLiked = Boolean(user?._id && likes[user._id])
  const likesCount = Object.keys(likes).length
  const comments = post.comments ?? []

  const theme = useTheme()
  const primary = theme.palette.primary.main
  const neutral = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  const [isComments, setIsComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentError, setCommentError] = useState<string | undefined>()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const authorName =
    [post.user?.firstName, post.user?.lastName].filter(Boolean).join(" ").trim() || "Unknown user"

  const patchLike = async () => {
    const { data } = await api.patch<{ message: string; updatedPost: Post }>(`/posts/${post._id}/like`)
    dispatch(setPost({ post: data.updatedPost }))
  }

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text) {
      setCommentError("Write a comment")
      return
    }
    try {
      setIsSubmittingComment(true)
      setCommentError(undefined)
      const { data } = await api.post<{ updatedPost: Post }>(`/posts/${post._id}/comments`, { text })
      dispatch(setPost({ post: data.updatedPost }))
      setCommentText("")
    } catch (err: unknown) {
      setCommentError(getErrorMessage(err, "Failed to add comment"))
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <WidgetWrapper>
      <Friend
        id={post.userId}
        name={authorName}
        subtitle={formatPostTime(post.createdAt)}
        url={post.user?.picturePath || ""}
        showFriendButton={false}
      />
      <Typography sx={{ color: neutral, mt: "1rem" }}>{post?.description}</Typography>
      {post?.url && (
        <Box
          component="img"
          width="100%"
          height="auto"
          alt="post"
          sx={{
            borderRadius: "0.75rem",
            marginTop: "0.75rem",
            display: "block",
          }}
          src={mediaUrl(post.url)}
        />
      )}
      <FlexBetween sx={{ mt: "0.25rem" }}>
        <FlexBetween sx={{ gap: "1rem" }}>
          <FlexBetween sx={{ gap: "0.3rem" }}>
            <IconButton onClick={patchLike} aria-label={isLiked ? "Unlike" : "Like"}>
              {isLiked ? <FavoriteOutlined sx={{ color: primary }} /> : <FavoriteBorderOutlined />}
            </IconButton>
            <Typography>{likesCount}</Typography>
          </FlexBetween>

          <FlexBetween sx={{ gap: "0.3rem" }}>
            <IconButton
              onClick={() => setIsComments(prev => !prev)}
              aria-label={isComments ? "Hide comments" : "Show comments"}
              aria-expanded={isComments}
            >
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <IconButton aria-label="Share" disabled>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box sx={{ mt: "0.5rem" }}>
          {comments.length === 0 && (
            <Typography sx={{ color: medium, m: "0.5rem 0", pl: "0.25rem", fontSize: "0.875rem" }}>
              No comments yet
            </Typography>
          )}
          {comments.map((comment, index) => {
            const name =
              [comment.user?.firstName, comment.user?.lastName].filter(Boolean).join(" ").trim() || "User"
            return (
              <Box key={comment._id || `${post._id}-c-${index}`}>
                <Divider />
                <Box sx={{ m: "0.5rem 0", pl: "1rem" }}>
                  <Typography sx={{ color: neutral, fontWeight: 500, fontSize: "0.875rem" }}>{name}</Typography>
                  <Typography sx={{ color: neutral }}>{comment.text}</Typography>
                  {comment.createdAt && (
                    <Typography sx={{ color: medium, fontSize: "0.75rem" }}>
                      {formatPostTime(comment.createdAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
          <Divider sx={{ mb: "0.75rem" }} />
          <Box component="form" onSubmit={submitComment} noValidate>
            <FlexBetween sx={{ gap: "0.5rem" }}>
              <InputBase
                fullWidth
                placeholder="Write a comment…"
                value={commentText}
                onChange={e => {
                  setCommentText(e.target.value)
                  if (commentError) setCommentError(undefined)
                }}
                disabled={isSubmittingComment}
                sx={{
                  backgroundColor: theme.palette.neutral.light,
                  borderRadius: "2rem",
                  padding: "0.5rem 1rem",
                  border: commentError ? `1px solid ${theme.palette.error.main}` : undefined,
                }}
              />
              <Button
                type="submit"
                disabled={isSubmittingComment}
                sx={{ color: theme.palette.background.alt, backgroundColor: primary, flexShrink: 0 }}
              >
                {isSubmittingComment ? "…" : "Post"}
              </Button>
            </FlexBetween>
            {commentError && (
              <Typography sx={{ color: "error.main", mt: "0.35rem", fontSize: "0.75rem" }} role="alert">
                {commentError}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </WidgetWrapper>
  )
}

export default PostWidget
