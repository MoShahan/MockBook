import express from "express"

import { getFeatures, patchFeatures } from "../controllers/settings.js"
import { requireAdmin, verifyAccessToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/features", verifyAccessToken, getFeatures)
router.patch("/features", verifyAccessToken, requireAdmin, patchFeatures)

export default router
