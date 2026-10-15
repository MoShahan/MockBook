import { verifyAccessTokenString } from "../lib/tokens.js"

export const verifyAccessToken = (req, res, next) => {
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
    req.user = verified
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
