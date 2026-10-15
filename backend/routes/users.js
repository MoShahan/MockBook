import express from "express"

import { addRemoveFriend, getUser, getUserFriends } from "../controllers/users.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

router.patch("/friends/:friendId", verifyAccessToken, requireObjectId("friendId"), addRemoveFriend)

router.get("/:id/friends", verifyAccessToken, requireObjectId("id"), getUserFriends)

router.get("/:id", verifyAccessToken, requireObjectId("id"), getUser)

export default router
