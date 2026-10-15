import jwt from "jsonwebtoken"

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

    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (!verified?.id) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    req.user = verified
    next()
  } catch {
    // Invalid signature, malformed token, expired, etc. — never 500 for bad client tokens
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
