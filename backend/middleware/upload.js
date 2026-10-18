import multer from "multer"

/** 5MB ceiling: allows typical phone photos; keeps ImageKit free-tier usage bounded vs unlimited uploads. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"])

/** In-memory uploads for ImageKit (no local disk). Field name: `picture`. */
export const uploadPicture = multer({
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
