import express from "express"

import {
  addComment,
  createPost,
  deletePost,
  getFeed,
  getPost,
  getUserPosts,
  likePost,
} from "../controllers/posts.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/", verifyAccessToken, getFeed)

router.post("/", verifyAccessToken, uploadPicture, createPost)

router.get("/:userId/posts", verifyAccessToken, requireObjectId("userId"), getUserPosts)

router.get("/:postId", verifyAccessToken, requireObjectId("postId"), getPost)

router.patch("/:postId/like", verifyAccessToken, requireObjectId("postId"), likePost)

router.post("/:postId/comments", verifyAccessToken, requireObjectId("postId"), addComment)

router.delete("/:postId", verifyAccessToken, requireObjectId("postId"), deletePost)

export default router
