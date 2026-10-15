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
import { verifyAccessToken } from "../middleware/auth.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/", verifyAccessToken, getFeed)

router.post("/", verifyAccessToken, uploadPicture, createPost)

router.get("/:userId/posts", verifyAccessToken, getUserPosts)

router.get("/:postId", verifyAccessToken, getPost)

router.patch("/:postId/like", verifyAccessToken, likePost)

router.post("/:postId/comments", verifyAccessToken, addComment)

router.delete("/:postId", verifyAccessToken, deletePost)

export default router
