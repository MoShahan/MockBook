import express from "express"

import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  editComment,
  getCommentedPosts,
  getCommentLikers,
  getFeed,
  getLikedPosts,
  getPost,
  getPostLikers,
  getSavedPosts,
  getUserPosts,
  likeComment,
  likePost,
  savePost,
  unsavePost,
  updatePost,
} from "../controllers/posts.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"
import { authCreateLimiter, authWriteLimiter } from "../middleware/rateLimit.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/", verifyAccessToken, getFeed)

router.post("/", verifyAccessToken, authCreateLimiter, uploadPicture, createPost)

/** Must be registered before `/:postId` so these paths are not treated as ids. */
router.get("/saved", verifyAccessToken, getSavedPosts)
router.get("/liked", verifyAccessToken, getLikedPosts)
router.get("/commented", verifyAccessToken, getCommentedPosts)

router.get("/:userId/posts", verifyAccessToken, requireObjectId("userId"), getUserPosts)

router.get("/:postId", verifyAccessToken, requireObjectId("postId"), getPost)

router.get("/:postId/likes", verifyAccessToken, requireObjectId("postId"), getPostLikers)

router.patch("/:postId/like", verifyAccessToken, authWriteLimiter, requireObjectId("postId"), likePost)

router.put("/:postId/save", verifyAccessToken, authWriteLimiter, requireObjectId("postId"), savePost)

router.delete("/:postId/save", verifyAccessToken, authWriteLimiter, requireObjectId("postId"), unsavePost)

router.post(
  "/:postId/comments",
  verifyAccessToken,
  authWriteLimiter,
  requireObjectId("postId"),
  addComment
)

router.get(
  "/:postId/comments/:commentId/likes",
  verifyAccessToken,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  getCommentLikers
)

router.patch(
  "/:postId/comments/:commentId/like",
  verifyAccessToken,
  authWriteLimiter,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  likeComment
)

router.patch(
  "/:postId/comments/:commentId",
  verifyAccessToken,
  authWriteLimiter,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  editComment
)

router.delete(
  "/:postId/comments/:commentId",
  verifyAccessToken,
  authWriteLimiter,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  deleteComment
)

router.patch(
  "/:postId",
  verifyAccessToken,
  authWriteLimiter,
  requireObjectId("postId"),
  uploadPicture,
  updatePost
)

router.delete("/:postId", verifyAccessToken, authWriteLimiter, requireObjectId("postId"), deletePost)

export default router
