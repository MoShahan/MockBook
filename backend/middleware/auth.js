import { verifyAccessTokenString } from "../lib/tokens.js"
import User from "../models/User.js"

export const verifyAccessToken = async (req, res, next) => {
  try {
    const header = req.header("Authorization")
    if (!header) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : header.trim()
    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json({ error: "Server auth is not configured" })
    }

    const verified = verifyAccessTokenString(token)
    const dbUser = await User.findById(verified.id).select("role isActive")
    if (!dbUser) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }
    if (dbUser.isActive === false) {
      return res.status(403).json({ error: "Account deactivated" })
    }

    req.user = {
      id: String(dbUser._id),
      role: dbUser.role || "user",
    }
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

/** Must run after verifyAccessToken. */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" })
  }
  next()
}
