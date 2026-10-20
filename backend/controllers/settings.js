import { getSiteSettingsDoc, patchSiteFeatures } from "../lib/features.js"

export const getFeatures = async (req, res, next) => {
  try {
    const doc = await getSiteSettingsDoc()
    res.status(200).json({
      features: doc.features,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
    })
  } catch (e) {
    next(e)
  }
}

export const patchFeatures = async (req, res, next) => {
  try {
    const partial = req.body?.features
    if (!partial || typeof partial !== "object" || Array.isArray(partial)) {
      return res.status(400).json({ error: "Body must include features object" })
    }

    const doc = await patchSiteFeatures(partial, req.user.id)
    res.status(200).json({
      features: doc.features,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy,
    })
  } catch (e) {
    if (e.status === 400 && e.expose) {
      return res.status(400).json({ error: e.message })
    }
    next(e)
  }
}
