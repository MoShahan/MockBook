"use client"

import React, { useState } from "react"
import {
  ChatBubbleOutlineOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  MoreVert,
  ShareOutlined,
} from "@mui/icons-material"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api, mediaUrl } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { formatPostTime } from "@/lib/time"
import { useToast } from "@/providers/ToastProvider"
import { removePost, setPost } from "@/state"
import type { Post } from "@/types/models"

import FlexBetween from "./FlexBetween"
import Friend from "./Friend"
import UserImage from "./UserImage"
import WidgetWrapper from "./WidgetWrapper"

type PostWidgetProps = { post: Post }

const PostWidget = ({ post }: PostWidgetProps) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()
  const likes = post.likes ?? {}
  const isLiked = Boolean(user?._id && likes[user._id])
  const likesCount = Object.keys(likes).length
  const comments = post.comments ?? []
  const isOwnPost = Boolean(user?._id && String(user._id) === String(post.userId))

  const theme = useTheme()
  const primary = theme.palette.primary.main
  const neutral = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  const [isComments, setIsComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [commentError, setCommentError] = useState<string | undefined>()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const authorName =
    [post.user?.firstName, post.user?.lastName].filter(Boolean).join(" ").trim() || "Unknown user"

  const patchLike = async () => {
    const { data } = await api.patch<{ message: string; updatedPost: Post }>(`/posts/${post._id}/like`)
    dispatch(setPost({ post: data.updatedPost }))
  }

  const patchCommentLike = async (commentId: string) => {
    try {
      const { data } = await api.patch<{ message: string; updatedPost: Post }>(
        `/posts/${post._id}/comments/${commentId}/like`
      )
      dispatch(setPost({ post: data.updatedPost }))
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Failed to update comment like"))
    }
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await api.delete(`/posts/${post._id}`)
      dispatch(removePost({ postId: post._id }))
      setConfirmDeleteOpen(false)
      success("Post deleted")
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Failed to delete post"))
    } finally {
      setIsDeleting(false)
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
        endAction={
          isOwnPost ? (
            <>
              <IconButton
                aria-label="Post options"
                aria-haspopup="true"
                aria-expanded={Boolean(menuAnchor)}
                onClick={e => setMenuAnchor(e.currentTarget)}
              >
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null)
                    setConfirmDeleteOpen(true)
                  }}
                >
                  <ListItemIcon>
                    <DeleteOutlined fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText slotProps={{ primary: { sx: { color: "error.main" } } }}>Delete post</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : undefined
        }
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
            const commentLikes = comment.likes ?? {}
            const isCommentLiked = Boolean(user?._id && commentLikes[user._id])
            const commentLikesCount = Object.keys(commentLikes).length
            return (
              <Box key={comment._id || `${post._id}-c-${index}`}>
                <Divider />
                <Box sx={{ display: "flex", gap: "0.75rem", m: "0.75rem 0", pl: "0.25rem", alignItems: "flex-start" }}>
                  <UserImage image={comment.user?.picturePath || ""} name={name} size="36px" />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      sx={{
                        color: theme.palette.neutral.dark,
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        lineHeight: 1.3,
                      }}
                    >
                      {name}
                    </Typography>
                    <Typography
                      sx={{
                        color: neutral,
                        fontWeight: 400,
                        fontSize: "0.9375rem",
                        mt: "0.15rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {comment.text}
                    </Typography>
                    <FlexBetween sx={{ mt: "0.2rem", justifyContent: "flex-start", gap: "0.75rem" }}>
                      {comment.createdAt && (
                        <Typography sx={{ color: medium, fontSize: "0.75rem" }}>
                          {formatPostTime(comment.createdAt)}
                        </Typography>
                      )}
                      {comment._id && (
                        <FlexBetween sx={{ gap: "0.15rem" }}>
                          <IconButton
                            size="small"
                            onClick={() => patchCommentLike(comment._id!)}
                            aria-label={isCommentLiked ? "Unlike comment" : "Like comment"}
                            sx={{ p: "0.15rem" }}
                          >
                            {isCommentLiked ? (
                              <FavoriteOutlined sx={{ fontSize: "0.95rem", color: primary }} />
                            ) : (
                              <FavoriteBorderOutlined sx={{ fontSize: "0.95rem", color: medium }} />
                            )}
                          </IconButton>
                          {commentLikesCount > 0 && (
                            <Typography sx={{ color: medium, fontSize: "0.75rem" }}>{commentLikesCount}</Typography>
                          )}
                        </FlexBetween>
                      )}
                    </FlexBetween>
                  </Box>
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

      <Dialog open={confirmDeleteOpen} onClose={() => !isDeleting && setConfirmDeleteOpen(false)}>
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <DialogContentText>This cannot be undone. The post will be removed from the feed.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </WidgetWrapper>
  )
}

export default PostWidget
