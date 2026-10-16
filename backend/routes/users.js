import express from "express"

import {
  addRemoveFriend,
  discoverUsers,
  getUser,
  getUserFriends,
  updateProfile,
} from "../controllers/users.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/discover", verifyAccessToken, discoverUsers)

router.patch("/me", verifyAccessToken, uploadPicture, updateProfile)

router.patch("/friends/:friendId", verifyAccessToken, requireObjectId("friendId"), addRemoveFriend)

router.get("/:id/friends", verifyAccessToken, requireObjectId("id"), getUserFriends)

router.get("/:id", verifyAccessToken, requireObjectId("id"), getUser)

export default router
