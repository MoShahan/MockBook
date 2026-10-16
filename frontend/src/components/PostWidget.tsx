"use client"

import React, { useState } from "react"
import {
  Bookmark,
  BookmarkBorder,
  ChatBubbleOutlineOutlined,
  ContentCopy,
  DeleteOutlined,
  EditOutlined,
  Facebook,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ImageOutlined,
  LinkedIn,
  MoreVert,
  ShareOutlined,
  WhatsApp,
  X,
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
import { buildShareText, buildShareUrls, openShareWindow } from "@/lib/share"
import { formatPostTime } from "@/lib/time"
import { useToast } from "@/providers/ToastProvider"
import { removePost, setPost, setSavedPosts } from "@/state"
import { type Post,sameUserId } from "@/types/models"

import ExpandableText from "./ExpandableText"
import FlexBetween from "./FlexBetween"
import Friend from "./Friend"
import LikersDialog from "./LikersDialog"
import UserImage from "./UserImage"
import WidgetWrapper from "./WidgetWrapper"

type PostWidgetProps = {
  post: Post
  /** Called after a successful delete (e.g. leave the single-post page). */
  onDeleted?: () => void
}

const COMMENTS_INITIAL_VISIBLE = 3
const COMMENTS_LOAD_STEP = 5

const PostWidget = ({ post, onDeleted }: PostWidgetProps) => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.user)
  const { success, error: toastError } = useToast()
  const likes = post.likes ?? {}
  const isLiked = Boolean(user?._id && likes[user._id])
  const likesCount = Object.keys(likes).length
  const comments = post.comments ?? []
  const isOwnPost = Boolean(user?._id && String(user._id) === String(post.userId))
  const isSaved = Boolean(user?.savedPosts?.some(id => String(id) === String(post._id)))

  const theme = useTheme()
  const primary = theme.palette.primary.main
  const neutral = theme.palette.neutral.main
  const medium = theme.palette.neutral.medium

  const [isComments, setIsComments] = useState(false)
  const [visibleCommentCount, setVisibleCommentCount] = useState(COMMENTS_INITIAL_VISIBLE)
  const [commentText, setCommentText] = useState("")
  const [commentError, setCommentError] = useState<string | undefined>()
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [shareAnchor, setShareAnchor] = useState<null | HTMLElement>(null)
  const [commentMenu, setCommentMenu] = useState<{ anchor: HTMLElement; commentId: string } | null>(
    null
  )
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentText, setEditCommentText] = useState("")
  const [editCommentError, setEditCommentError] = useState<string | undefined>()
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null)
  const [isDeletingComment, setIsDeletingComment] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [likersOpen, setLikersOpen] = useState(false)
  const [commentLikersId, setCommentLikersId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editDescription, setEditDescription] = useState("")
  const [editPicture, setEditPicture] = useState<File | null>(null)
  const [editRemoveImage, setEditRemoveImage] = useState(false)
  const [editError, setEditError] = useState<string | undefined>()
  const [isSavingEditPost, setIsSavingEditPost] = useState(false)

  const authorName =
    [post.user?.firstName, post.user?.lastName].filter(Boolean).join(" ").trim() || "Unknown user"

  const patchLike = async () => {
    const { data } = await api.patch<{ message: string; updatedPost: Post }>(`/posts/${post._id}/like`)
    dispatch(setPost({ post: data.updatedPost }))
  }

  const toggleSave = async () => {
    try {
      const { data } = isSaved
        ? await api.delete<{ message: string; saved: boolean; savedPosts: string[] }>(
            `/posts/${post._id}/save`
          )
        : await api.put<{ message: string; saved: boolean; savedPosts: string[] }>(
            `/posts/${post._id}/save`
          )
      dispatch(setSavedPosts({ savedPosts: data.savedPosts }))
      success(data.message || (data.saved ? "Post saved" : "Post unsaved"))
    } catch (err: unknown) {
      toastError(getErrorMessage(err, isSaved ? "Failed to unsave post" : "Failed to save post"))
    }
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
      // Keep the new comment visible (comments are appended at the end).
      setVisibleCommentCount(data.updatedPost.comments?.length ?? COMMENTS_INITIAL_VISIBLE)
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
      onDeleted?.()
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Failed to delete post"))
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditPost = () => {
    setMenuAnchor(null)
    setEditDescription(post.description || "")
    setEditPicture(null)
    setEditRemoveImage(false)
    setEditError(undefined)
    setEditOpen(true)
  }

  const closeEditPost = () => {
    if (isSavingEditPost) return
    setEditOpen(false)
    setEditPicture(null)
    setEditRemoveImage(false)
    setEditError(undefined)
  }

  const saveEditPost = async () => {
    const description = editDescription.trim()
    const keepingImage = Boolean(post.url) && !editRemoveImage
    const addingImage = Boolean(editPicture)
    if (!description && !keepingImage && !addingImage) {
      setEditError("Add text or a photo")
      return
    }

    try {
      setIsSavingEditPost(true)
      setEditError(undefined)
      const formData = new FormData()
      formData.append("description", description)
      if (editRemoveImage && !editPicture) {
        formData.append("removeImage", "true")
      }
      if (editPicture) {
        formData.append("picture", editPicture)
      }

      const { data } = await api.patch<{ message: string; updatedPost: Post }>(
        `/posts/${post._id}`,
        formData
      )
      dispatch(setPost({ post: data.updatedPost }))
      setEditOpen(false)
      setEditPicture(null)
      setEditRemoveImage(false)
      success(data.message || "Post updated")
    } catch (err: unknown) {
      setEditError(getErrorMessage(err, "Failed to update post"))
      toastError(getErrorMessage(err, "Failed to update post"))
    } finally {
      setIsSavingEditPost(false)
    }
  }

  const share = buildShareUrls(post._id, { text: buildShareText(post.description) })

  const copyPostLink = async () => {
    setShareAnchor(null)
    try {
      await navigator.clipboard.writeText(share.pageUrl)
      success("Link copied")
    } catch {
      toastError("Could not copy link")
    }
  }

  const shareTo = (url: string) => {
    setShareAnchor(null)
    openShareWindow(url)
  }

  const startEditComment = (commentId: string, currentText: string) => {
    setCommentMenu(null)
    setEditingCommentId(commentId)
    setEditCommentText(currentText)
    setEditCommentError(undefined)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentText("")
    setEditCommentError(undefined)
  }

  const saveEditComment = async (commentId: string) => {
    const text = editCommentText.trim()
    if (!text) {
      setEditCommentError("Write a comment")
      return
    }
    if (text.length > 2000) {
      setEditCommentError("Comment is too long")
      return
    }
    try {
      setIsSavingEdit(true)
      setEditCommentError(undefined)
      const { data } = await api.patch<{ message: string; updatedPost: Post }>(
        `/posts/${post._id}/comments/${commentId}`,
        { text }
      )
      dispatch(setPost({ post: data.updatedPost }))
      cancelEditComment()
      success("Comment updated")
    } catch (err: unknown) {
      setEditCommentError(getErrorMessage(err, "Failed to update comment"))
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!confirmDeleteCommentId) return
    try {
      setIsDeletingComment(true)
      const { data } = await api.delete<{ message: string; updatedPost: Post }>(
        `/posts/${post._id}/comments/${confirmDeleteCommentId}`
      )
      dispatch(setPost({ post: data.updatedPost }))
      setConfirmDeleteCommentId(null)
      if (editingCommentId === confirmDeleteCommentId) cancelEditComment()
      success("Comment deleted")
    } catch (err: unknown) {
      toastError(getErrorMessage(err, "Failed to delete comment"))
    } finally {
      setIsDeletingComment(false)
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
                <MenuItem onClick={openEditPost}>
                  <ListItemIcon>
                    <EditOutlined fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit post</ListItemText>
                </MenuItem>
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
      {post?.description ? (
        <ExpandableText
          text={post.description}
          maxWords={40}
          typographySx={{ color: neutral, mt: "1rem" }}
          buttonSx={{ color: primary, ml: 0 }}
        />
      ) : null}
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
            <Typography
              component="button"
              type="button"
              onClick={() => setLikersOpen(true)}
              aria-label={`View who liked this post (${likesCount})`}
              sx={{
                border: 0,
                background: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                color: "inherit",
                font: "inherit",
                "&:hover": { textDecoration: "underline", color: primary },
              }}
            >
              {likesCount}
            </Typography>
          </FlexBetween>

          <FlexBetween sx={{ gap: "0.3rem" }}>
            <IconButton
              onClick={() => {
                setIsComments(prev => {
                  if (prev) setVisibleCommentCount(COMMENTS_INITIAL_VISIBLE)
                  return !prev
                })
              }}
              aria-label={isComments ? "Hide comments" : "Show comments"}
              aria-expanded={isComments}
            >
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>
        <FlexBetween sx={{ gap: "0.15rem" }}>
          <IconButton
            onClick={() => void toggleSave()}
            aria-label={isSaved ? "Unsave post" : "Save post"}
            aria-pressed={isSaved}
          >
            {isSaved ? <Bookmark sx={{ color: primary }} /> : <BookmarkBorder />}
          </IconButton>
          <IconButton
            aria-label="Share"
            aria-haspopup="true"
            aria-expanded={Boolean(shareAnchor)}
            onClick={e => setShareAnchor(e.currentTarget)}
          >
            <ShareOutlined />
          </IconButton>
        </FlexBetween>
        <Menu
          anchorEl={shareAnchor}
          open={Boolean(shareAnchor)}
          onClose={() => setShareAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={copyPostLink}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy link</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareTo(share.x)}>
            <ListItemIcon>
              <X fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share on X</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareTo(share.facebook)}>
            <ListItemIcon>
              <Facebook fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share on Facebook</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareTo(share.linkedin)}>
            <ListItemIcon>
              <LinkedIn fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share on LinkedIn</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareTo(share.whatsapp)}>
            <ListItemIcon>
              <WhatsApp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share on WhatsApp</ListItemText>
          </MenuItem>
        </Menu>
      </FlexBetween>
      {isComments && (
        <Box sx={{ mt: "0.5rem" }}>
          {comments.length === 0 && (
            <Typography sx={{ color: medium, m: "0.5rem 0", pl: "0.25rem", fontSize: "0.875rem" }}>
              No comments yet
            </Typography>
          )}
          {comments.slice(0, visibleCommentCount).map((comment, index) => {
            const name =
              [comment.user?.firstName, comment.user?.lastName].filter(Boolean).join(" ").trim() || "User"
            const commentLikes = comment.likes ?? {}
            const isCommentLiked = Boolean(user?._id && commentLikes[user._id])
            const commentLikesCount = Object.keys(commentLikes).length
            const isOwnComment = Boolean(comment._id && sameUserId(user?._id, comment.userId))
            const isEditing = Boolean(comment._id && editingCommentId === comment._id)
            return (
              <Box key={comment._id || `${post._id}-c-${index}`}>
                <Divider />
                <Box sx={{ display: "flex", gap: "0.75rem", m: "0.75rem 0", pl: "0.25rem", alignItems: "flex-start" }}>
                  <UserImage image={comment.user?.picturePath || ""} name={name} size="36px" />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <FlexBetween sx={{ alignItems: "flex-start" }}>
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
                      {isOwnComment && comment._id && !isEditing && (
                        <IconButton
                          size="small"
                          aria-label="Comment options"
                          aria-haspopup="true"
                          aria-expanded={commentMenu?.commentId === comment._id}
                          onClick={e => setCommentMenu({ anchor: e.currentTarget, commentId: comment._id! })}
                          sx={{ p: "0.15rem", ml: "0.25rem" }}
                        >
                          <MoreVert sx={{ fontSize: "1.1rem" }} />
                        </IconButton>
                      )}
                    </FlexBetween>
                    {isEditing && comment._id ? (
                      <Box sx={{ mt: "0.35rem" }}>
                        <InputBase
                          fullWidth
                          multiline
                          maxRows={4}
                          value={editCommentText}
                          onChange={e => {
                            setEditCommentText(e.target.value)
                            if (editCommentError) setEditCommentError(undefined)
                          }}
                          disabled={isSavingEdit}
                          sx={{
                            backgroundColor: theme.palette.neutral.light,
                            borderRadius: "0.75rem",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.9375rem",
                            border: editCommentError ? `1px solid ${theme.palette.error.main}` : undefined,
                          }}
                        />
                        {editCommentError && (
                          <Typography sx={{ color: "error.main", mt: "0.25rem", fontSize: "0.75rem" }} role="alert">
                            {editCommentError}
                          </Typography>
                        )}
                        <Box sx={{ display: "flex", gap: "0.5rem", mt: "0.5rem" }}>
                          <Button
                            size="small"
                            disabled={isSavingEdit}
                            onClick={() => saveEditComment(comment._id!)}
                            sx={{ color: theme.palette.background.alt, backgroundColor: primary }}
                          >
                            {isSavingEdit ? "Saving…" : "Save"}
                          </Button>
                          <Button size="small" disabled={isSavingEdit} onClick={cancelEditComment}>
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <ExpandableText
                        text={comment.text}
                        maxWords={30}
                        typographySx={{
                          color: neutral,
                          fontWeight: 400,
                          fontSize: "0.9375rem",
                          mt: "0.15rem",
                          lineHeight: 1.4,
                        }}
                        buttonSx={{ color: primary }}
                      />
                    )}
                    <FlexBetween sx={{ mt: "0.2rem", justifyContent: "flex-start", gap: "0.75rem" }}>
                      {comment.createdAt && (
                        <Typography sx={{ color: medium, fontSize: "0.75rem" }}>
                          {formatPostTime(comment.createdAt)}
                        </Typography>
                      )}
                      {comment._id && !isEditing && (
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
                          <Typography
                            component="button"
                            type="button"
                            onClick={() => setCommentLikersId(comment._id!)}
                            aria-label={`View who liked this comment (${commentLikesCount})`}
                            sx={{
                              border: 0,
                              background: "none",
                              padding: 0,
                              margin: 0,
                              cursor: "pointer",
                              color: medium,
                              fontSize: "0.75rem",
                              fontFamily: "inherit",
                              lineHeight: "inherit",
                              "&:hover": { textDecoration: "underline", color: primary },
                            }}
                          >
                            {commentLikesCount}
                          </Typography>
                        </FlexBetween>
                      )}
                    </FlexBetween>
                  </Box>
                </Box>
              </Box>
            )
          })}
          {comments.length > visibleCommentCount && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 0.5 }}>
              <Button
                size="small"
                onClick={() =>
                  setVisibleCommentCount(count =>
                    Math.min(count + COMMENTS_LOAD_STEP, comments.length)
                  )
                }
                sx={{ textTransform: "none", color: primary }}
              >
                View more ({comments.length - visibleCommentCount} more)
              </Button>
            </Box>
          )}
          <Menu
            anchorEl={commentMenu?.anchor ?? null}
            open={Boolean(commentMenu)}
            onClose={() => setCommentMenu(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              onClick={() => {
                const target = comments.find(c => c._id === commentMenu?.commentId)
                if (target?._id) startEditComment(target._id, target.text)
              }}
            >
              <ListItemIcon>
                <EditOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                const id = commentMenu?.commentId
                setCommentMenu(null)
                if (id) setConfirmDeleteCommentId(id)
              }}
            >
              <ListItemIcon>
                <DeleteOutlined fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { sx: { color: "error.main" } } }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
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

      <Dialog open={editOpen} onClose={closeEditPost} fullWidth maxWidth="sm">
        <DialogTitle>Edit post</DialogTitle>
        <DialogContent>
          <InputBase
            fullWidth
            multiline
            minRows={3}
            maxRows={8}
            value={editDescription}
            onChange={e => {
              setEditDescription(e.target.value)
              if (editError) setEditError(undefined)
            }}
            disabled={isSavingEditPost}
            placeholder="What's on your mind?"
            sx={{
              mt: 1,
              backgroundColor: theme.palette.neutral.light,
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              border: editError ? `1px solid ${theme.palette.error.main}` : undefined,
            }}
          />
          {editError && (
            <Typography sx={{ color: "error.main", mt: "0.35rem", fontSize: "0.75rem" }} role="alert">
              {editError}
            </Typography>
          )}

          {post.url && !editRemoveImage && !editPicture && (
            <Box sx={{ mt: "1rem" }}>
              <Box
                component="img"
                src={mediaUrl(post.url)}
                alt="Current post"
                sx={{ width: "100%", maxHeight: 240, objectFit: "contain", borderRadius: "0.75rem" }}
              />
              <Button
                size="small"
                color="error"
                disabled={isSavingEditPost}
                onClick={() => setEditRemoveImage(true)}
                sx={{ mt: 0.5, textTransform: "none" }}
              >
                Remove image
              </Button>
            </Box>
          )}

          {(editRemoveImage || !post.url) && !editPicture && (
            <Typography sx={{ color: medium, mt: "0.75rem", fontSize: "0.8125rem" }}>
              {editRemoveImage ? "Image will be removed on save." : "No image on this post."}
            </Typography>
          )}

          {editPicture && (
            <Typography sx={{ color: neutral, mt: "0.75rem", fontSize: "0.875rem" }}>
              New image: {editPicture.name}
            </Typography>
          )}

          <Box sx={{ mt: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button
              component="label"
              size="small"
              startIcon={<ImageOutlined />}
              disabled={isSavingEditPost}
              sx={{ textTransform: "none" }}
            >
              {editPicture || post.url ? "Replace image" : "Add image"}
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={e => {
                  const file = e.target.files?.[0] ?? null
                  setEditPicture(file)
                  if (file) setEditRemoveImage(false)
                  if (editError) setEditError(undefined)
                  e.target.value = ""
                }}
              />
            </Button>
            {editPicture && (
              <Button
                size="small"
                disabled={isSavingEditPost}
                onClick={() => setEditPicture(null)}
                sx={{ textTransform: "none" }}
              >
                Clear new image
              </Button>
            )}
            {editRemoveImage && (
              <Button
                size="small"
                disabled={isSavingEditPost}
                onClick={() => setEditRemoveImage(false)}
                sx={{ textTransform: "none" }}
              >
                Keep current image
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditPost} disabled={isSavingEditPost}>
            Cancel
          </Button>
          <Button onClick={() => void saveEditPost()} disabled={isSavingEditPost} variant="contained">
            {isSavingEditPost ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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

      <Dialog
        open={Boolean(confirmDeleteCommentId)}
        onClose={() => !isDeletingComment && setConfirmDeleteCommentId(null)}
      >
        <DialogTitle>Delete comment?</DialogTitle>
        <DialogContent>
          <DialogContentText>This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteCommentId(null)} disabled={isDeletingComment}>
            Cancel
          </Button>
          <Button onClick={handleDeleteComment} color="error" disabled={isDeletingComment} autoFocus>
            {isDeletingComment ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <LikersDialog
        open={likersOpen}
        onClose={() => setLikersOpen(false)}
        fetchPath={likersOpen ? `/posts/${post._id}/likes` : null}
        title="Liked by"
      />

      <LikersDialog
        open={Boolean(commentLikersId)}
        onClose={() => setCommentLikersId(null)}
        fetchPath={
          commentLikersId ? `/posts/${post._id}/comments/${commentLikersId}/likes` : null
        }
        title="Liked by"
      />
    </WidgetWrapper>
  )
}

export default PostWidget
