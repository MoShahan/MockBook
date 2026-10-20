import multer from "multer"

import { sniffImageMime } from "../lib/imageSniff.js"

/** 5MB ceiling: allows typical phone photos; keeps ImageKit free-tier usage bounded vs unlimited uploads. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"])

const multerPicture = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase()
    if (!ALLOWED_MIME.has(mime)) {
      cb(new Error("Only image uploads are allowed"))
      return
    }
    cb(null, true)
  },
}).single("picture")

/**
 * In-memory uploads for ImageKit (no local disk). Field name: `picture`.
 * Validates magic bytes after multer (A5) - client MIME alone is not trusted.
 */
export function uploadPicture(req, res, next) {
  multerPicture(req, res, err => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller"
          : err.message || "Upload failed"
      return res.status(400).json({ error: message })
    }

    if (req.file?.buffer) {
      const sniffed = sniffImageMime(req.file.buffer)
      if (!sniffed) {
        return res.status(400).json({ error: "File content is not a valid image" })
      }
      req.file.mimetype = sniffed
    }

    next()
  })
}
