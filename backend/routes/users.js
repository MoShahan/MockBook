import express from "express"

import {
  acceptFriendRequest,
  cancelFriendRequest,
  countIncomingFriendRequests,
  declineFriendRequest,
  followUser,
  getUserRelationship,
  listFollowing,
  listFriendRequests,
  sendFriendRequest,
  unfollowUser,
  unfriend,
} from "../controllers/relationships.js"
import { discoverUsers, getUser, getUserFriends, updateProfile } from "../controllers/users.js"
import { requireObjectId } from "../lib/objectId.js"
import { verifyAccessToken } from "../middleware/auth.js"
import { uploadPicture } from "../middleware/upload.js"

const router = express.Router()

router.get("/discover", verifyAccessToken, discoverUsers)

router.patch("/me", verifyAccessToken, uploadPicture, updateProfile)

router.get("/me/friend-requests/count", verifyAccessToken, countIncomingFriendRequests)
router.get("/me/friend-requests", verifyAccessToken, listFriendRequests)
router.post(
  "/me/friend-requests/:requestId/accept",
  verifyAccessToken,
  requireObjectId("requestId"),
  acceptFriendRequest
)
router.post(
  "/me/friend-requests/:requestId/decline",
  verifyAccessToken,
  requireObjectId("requestId"),
  declineFriendRequest
)
router.delete(
  "/me/friend-requests/:requestId",
  verifyAccessToken,
  requireObjectId("requestId"),
  cancelFriendRequest
)
router.delete("/me/friends/:friendId", verifyAccessToken, requireObjectId("friendId"), unfriend)
router.get("/me/following", verifyAccessToken, listFollowing)

router.post("/:id/friend-requests", verifyAccessToken, requireObjectId("id"), sendFriendRequest)
router.post("/:id/follow", verifyAccessToken, requireObjectId("id"), followUser)
router.delete("/:id/follow", verifyAccessToken, requireObjectId("id"), unfollowUser)
router.get("/:id/relationship", verifyAccessToken, requireObjectId("id"), getUserRelationship)

router.get("/:id/friends", verifyAccessToken, requireObjectId("id"), getUserFriends)

router.get("/:id", verifyAccessToken, requireObjectId("id"), getUser)

export default router
