import express from "express"

import { addRemoveFriend, getUser, getUserFriends } from "../controllers/users.js"
import { verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/:id", verifyAccessToken, getUser)

router.get("/:id/friends", verifyAccessToken, getUserFriends)

router.patch("/:id/:friendId", verifyAccessToken, addRemoveFriend)

export default router
