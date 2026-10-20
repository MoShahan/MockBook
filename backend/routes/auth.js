import express from "express"
import rateLimit from "express-rate-limit"

import { login, logout, me, refresh, register } from "../controllers/auth.js"
import { listOauthProviders, oauthCallback, startOauth } from "../controllers/oauth.js"
import { verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

const OAUTH_PROVIDERS = new Set(["google", "github", "discord"])

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
  skip: () => process.env.NODE_ENV === "test",
})

function requireOauthProvider(req, res, next) {
  if (!OAUTH_PROVIDERS.has(req.params.provider)) {
    return res.status(404).json({ error: "Unknown OAuth provider" })
  }
  next()
}

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.post("/refresh", authLimiter, refresh)
router.post("/logout", verifyAccessToken, logout)
router.get("/me", verifyAccessToken, me)

router.get("/providers", listOauthProviders)
router.get("/:provider", authLimiter, requireOauthProvider, startOauth)
router.get("/:provider/callback", authLimiter, requireOauthProvider, oauthCallback)

export default router
