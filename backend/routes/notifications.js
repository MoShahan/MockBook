import express from "express"

import {
  listNotifications,
  markAllRead,
  markOneRead,
  unreadCount,
} from "../controllers/notifications.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/", verifyAccessToken, listNotifications)
router.get("/unread-count", verifyAccessToken, unreadCount)
router.patch("/read-all", verifyAccessToken, markAllRead)
router.patch("/:id/read", verifyAccessToken, requireObjectId("id"), markOneRead)

export default router
