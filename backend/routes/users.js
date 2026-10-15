import express from "express"

import { addRemoveFriend, getUser, getUserFriends } from "../controllers/users.js"
import { verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

// Specific paths before `/:id`
router.patch("/friends/:friendId", verifyAccessToken, addRemoveFriend)

router.get("/:id/friends", verifyAccessToken, getUserFriends)

router.get("/:id", verifyAccessToken, getUser)

export default router
