import express from "express"

import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  editComment,
  getCommentLikers,
  getFeed,
  getPost,
  getPostLikers,
  getSavedPosts,
  getUserPosts,
  likeComment,
  likePost,
  savePost,
  unsavePost,
} from "../controllers/posts.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/", verifyAccessToken, getFeed)

router.post("/", verifyAccessToken, uploadPicture, createPost)

/** Must be registered before `/:postId` so "saved" is not treated as an id. */
router.get("/saved", verifyAccessToken, getSavedPosts)

router.get("/:userId/posts", verifyAccessToken, requireObjectId("userId"), getUserPosts)

router.get("/:postId", verifyAccessToken, requireObjectId("postId"), getPost)

router.get("/:postId/likes", verifyAccessToken, requireObjectId("postId"), getPostLikers)

router.patch("/:postId/like", verifyAccessToken, requireObjectId("postId"), likePost)

router.put("/:postId/save", verifyAccessToken, requireObjectId("postId"), savePost)

router.delete("/:postId/save", verifyAccessToken, requireObjectId("postId"), unsavePost)

router.post("/:postId/comments", verifyAccessToken, requireObjectId("postId"), addComment)

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
  requireObjectId("postId"),
  requireObjectId("commentId"),
  likeComment
)

router.patch(
  "/:postId/comments/:commentId",
  verifyAccessToken,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  editComment
)

router.delete(
  "/:postId/comments/:commentId",
  verifyAccessToken,
  requireObjectId("postId"),
  requireObjectId("commentId"),
  deleteComment
)

router.delete("/:postId", verifyAccessToken, requireObjectId("postId"), deletePost)

export default router
