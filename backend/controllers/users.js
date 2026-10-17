import { formatFriendsList } from "../lib/friends.js"
import { uploadImageBuffer } from "../lib/imagekit.js"
import {
  DEFAULT_AVATAR_COLOR,
  DEFAULT_COVER_COLOR,
  sanitizeProfileColor,
} from "../lib/profileColors.js"
import { getRelationshipsMap } from "../lib/relationships.js"
import { pickSocialFields } from "../lib/social.js"
import User from "../models/User.js"

const PUBLIC_USER_FIELDS =
  "_id firstName lastName picturePath avatarColor coverColor location occupation facebook x linkedin instagram friends viewedProfile createdAt role isActive"

const DISCOVER_FIELDS = "_id firstName lastName picturePath avatarColor location occupation"

function sanitizeName(raw, fallback) {
  if (typeof raw !== "string") return fallback
  const trimmed = raw.trim().replace(/\s+/g, " ")
  if (!trimmed) return fallback
  return trimmed.slice(0, 50)
}

function sanitizeShortText(raw, max = 100) {
  if (typeof raw !== "string") return ""
  return raw.trim().replace(/\s+/g, " ").slice(0, max)
}

/** Public profile JSON (no password). Friends stay as raw ids unless formatted separately. */
function toPublicUser(userDoc) {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }
  delete user.password
  delete user.__v
  user._id = String(user._id)
  user.friends = (user.friends || []).map(id => String(id))
  // following is private to the owner — strip from public profile payloads
  delete user.following
  user.savedPosts = (user.savedPosts || []).map(id => String(id))
  user.facebook = user.facebook || ""
  user.x = user.x || ""
  user.linkedin = user.linkedin || ""
  user.instagram = user.instagram || ""
  user.avatarColor = user.avatarColor || DEFAULT_AVATAR_COLOR
  user.coverColor = user.coverColor || DEFAULT_COVER_COLOR
  user.role = user.role || "user"
  user.isActive = user.isActive !== false
  return user
}

/** Admin: soft-deactivate a user (cannot log in). */
export const deactivateUser = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }
    const authUserId = req.user.id
    const { id } = req.params
    if (String(authUserId) === String(id)) {
      return res.status(400).json({ error: "Cannot deactivate your own account" })
    }

    const target = await User.findById(id)
    if (!target) return res.status(404).json({ msg: "User not found" })
    if (target.role === "admin") {
      return res.status(400).json({ error: "Cannot deactivate an admin account" })
    }

    target.isActive = false
    target.deactivatedAt = new Date()
    target.deactivatedBy = authUserId
    await target.save()

    res.status(200).json({ message: "User deactivated", user: toPublicUser(target) })
  } catch (e) {
    next(e)
  }
}

/** Admin: reactivate a deactivated user. */
export const reactivateUser = async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }
    const { id } = req.params
    const target = await User.findById(id)
    if (!target) return res.status(404).json({ msg: "User not found" })

    target.isActive = true
    target.deactivatedAt = null
    target.deactivatedBy = null
    await target.save()

    res.status(200).json({ message: "User reactivated", user: toPublicUser(target) })
  } catch (e) {
    next(e)
  }
}

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select(PUBLIC_USER_FIELDS)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Count a profile visit when someone other than the owner loads the profile.
    const viewerId = req.user?.id
    if (viewerId && String(viewerId) !== String(id)) {
      await User.updateOne({ _id: id }, { $inc: { viewedProfile: 1 } })
      user.viewedProfile = (user.viewedProfile || 0) + 1
    }

    res.status(200).json(toPublicUser(user))
  } catch (e) {
    next(e)
  }
}

/**
 * Own-profile update: names, location, occupation, social handles, optional avatar.
 * Multipart field `picture` for avatar; text fields in body.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const authUserId = req.user?.id
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const user = await User.findById(authUserId)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "firstName")) {
      user.firstName = sanitizeName(req.body.firstName, user.firstName)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "lastName")) {
      user.lastName = sanitizeName(req.body.lastName, user.lastName)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "location")) {
      user.location = sanitizeShortText(req.body.location, 100)
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "occupation")) {
      user.occupation = sanitizeShortText(req.body.occupation, 100)
    }

    const social = pickSocialFields(req.body)
    for (const [key, value] of Object.entries(social)) {
      user[key] = value
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "avatarColor")) {
      const color = sanitizeProfileColor(req.body.avatarColor)
      if (!color) {
        return res.status(400).json({ error: "Invalid avatar color" })
      }
      user.avatarColor = color
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "coverColor")) {
      const color = sanitizeProfileColor(req.body.coverColor)
      if (!color) {
        return res.status(400).json({ error: "Invalid cover color" })
      }
      user.coverColor = color
    }

    if (req.file?.buffer) {
      const uploaded = await uploadImageBuffer(
        req.file.buffer,
        req.file.originalname,
        "/xivi/avatars"
      )
      user.picturePath = uploaded.url || user.picturePath
    }

    await user.save()

    const safe = toPublicUser(user)
    safe.friends = await formatFriendsList(user.friends)
    res.status(200).json({ user: safe })
  } catch (e) {
    if (e.message?.includes("IMAGEKIT_PRIVATE_KEY")) {
      return res.status(503).json({ error: "Image upload is not configured" })
    }
    next(e)
  }
}

/**
 * Discover users: recent registrants by default, or name/email search when `q` is set.
 * Excludes the authenticated user. Limit 10-20.
 */
export const discoverUsers = async (req, res, next) => {
  try {
    const authUserId = req.user?.id
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const rawLimit = Number.parseInt(String(req.query.limit ?? "10"), 10)
    const limit = Math.min(20, Math.max(1, Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 10))
    const q = typeof req.query.q === "string" ? req.query.q.trim() : ""

    const filter = { _id: { $ne: authUserId }, isActive: { $ne: false } }

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      const re = new RegExp(escaped, "i")
      filter.$or = [{ firstName: re }, { lastName: re }, { email: re }]
    }

    const users = await User.find(filter)
      .select(DISCOVER_FIELDS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const ids = users.map(u => String(u._id))
    const relMap = await getRelationshipsMap(authUserId, ids)

    res.status(200).json({
      users: users.map(u => {
        const id = String(u._id)
        const rel = relMap[id] || {
          isFriend: false,
          isFollowing: false,
          outgoingRequestId: null,
          incomingRequestId: null,
        }
        return {
          _id: id,
          firstName: u.firstName,
          lastName: u.lastName,
          picturePath: u.picturePath || "",
          avatarColor: u.avatarColor || DEFAULT_AVATAR_COLOR,
          location: u.location || "",
          occupation: u.occupation || "",
          relationship: rel,
        }
      }),
    })
  } catch (e) {
    next(e)
  }
}

export const getUserFriends = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }
    const formattedFriends = await formatFriendsList(user.friends)
    res.status(200).json(formattedFriends)
  } catch (e) {
    next(e)
  }
}

