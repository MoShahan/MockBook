import express from "express"
import rateLimit from "express-rate-limit"

import { login, refresh, register } from "../controllers/auth.js"

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
})

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.post("/refresh", authLimiter, refresh)

export default router
