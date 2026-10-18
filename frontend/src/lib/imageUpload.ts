/** Match backend `middleware/upload.js` Multer limit. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export const MAX_IMAGE_LABEL = "5 MB"

export const ACCEPT_IMAGE = "image/jpeg,image/png,image/gif,image/webp"

const ALLOWED_TYPES = new Set(ACCEPT_IMAGE.split(","))

/** Client-side image checks before multipart upload. Returns an error message or null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, GIF, or WebP image"
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Image must be ${MAX_IMAGE_LABEL} or smaller`
  }
  return null
}
