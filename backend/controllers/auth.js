import bcrypt from "bcrypt"

import { roleForEmail } from "../lib/admins.js"
import { formatFriendsList } from "../lib/friends.js"
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "../lib/password.js"
import { issueAuthTokens, verifyRefreshTokenString } from "../lib/tokens.js"
import User from "../models/User.js"

const toSafeUser = userDoc => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }
  delete user.password
  user.savedPosts = (user.savedPosts || []).map(id => String(id))
  user.following = (user.following || []).map(id => String(id))
  user.role = user.role || "user"
  user.isActive = user.isActive !== false
  return user
}

const withFormattedFriends = async userDoc => {
  const safeUser = toSafeUser(userDoc)
  safeUser.friends = await formatFriendsList(userDoc.friends)
  safeUser.following = (userDoc.following || []).map(id => String(id))
  return safeUser
}

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body
    const trimmedFirst = typeof firstName === "string" ? firstName.trim() : ""
    const trimmedLast = typeof lastName === "string" ? lastName.trim() : ""

    if (!trimmedFirst || !trimmedLast || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }
    if (trimmedFirst.length > 50 || trimmedLast.length > 50) {
      return res.status(400).json({ error: "Names must be at most 50 characters" })
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: PASSWORD_POLICY_MESSAGE })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const salt = await bcrypt.genSalt()
    const hashedPass = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: normalizedEmail,
      password: hashedPass,
      picturePath: "",
      role: roleForEmail(normalizedEmail),
      isActive: true,
      friends: [],
      following: [],
      savedPosts: [],
      location: "",
      occupation: "",
      viewedProfile: 0,
    })

    const savedUser = await newUser.save()
    const tokens = issueAuthTokens(savedUser._id)
    const user = await withFormattedFriends(savedUser)

    res.status(201).json({ user, ...tokens })
  } catch (e) {
    next(e)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail }).select("+password")
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    const passMatch = await bcrypt.compare(password, user.password)
    if (!passMatch) {
      return res.status(400).json({ error: "Invalid credentials" })
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: "Account deactivated" })
    }

    // Keep allowlisted emails promoted to admin (never demote here).
    const nextRole = roleForEmail(user.email, user.role)
    if (nextRole !== user.role) {
      user.role = nextRole
      await user.save()
    }

    const tokens = issueAuthTokens(user._id)
    const safeUser = await withFormattedFriends(user)

    res.status(200).json({ user: safeUser, ...tokens })
  } catch (e) {
    next(e)
  }
}

/** Current user from Bearer access token. */
export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ error: "Unauthenticated" })
    const user = await User.findById(userId)
    if (!user) return res.status(401).json({ error: "Unauthenticated" })
    if (user.isActive === false) return res.status(403).json({ error: "Account deactivated" })
    const nextRole = roleForEmail(user.email, user.role)
    if (nextRole !== user.role) {
      user.role = nextRole
      await user.save()
    }
    const safeUser = await withFormattedFriends(user)
    res.status(200).json({ user: safeUser })
  } catch (e) {
    next(e)
  }
}

/** Exchange a valid refresh token for a new access + refresh pair. */
export const refresh = async (req, res, next) => {
  try {
    const refreshToken =
      (typeof req.body?.refreshToken === "string" && req.body.refreshToken.trim()) ||
      (req.header("Authorization")?.startsWith("Bearer ")
        ? req.header("Authorization").slice(7).trim()
        : "")

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" })
    }

    let payload
    try {
      payload = verifyRefreshTokenString(refreshToken)
    } catch {
      return res.status(401).json({ error: "Invalid or expired refresh token" })
    }

    const user = await User.findById(payload.id)
    if (!user) {
      return res.status(401).json({ error: "Invalid or expired refresh token" })
    }
    if (user.isActive === false) {
      return res.status(403).json({ error: "Account deactivated" })
    }

    const tokens = issueAuthTokens(user._id)
    res.status(200).json(tokens)
  } catch (e) {
    next(e)
  }
}
