import crypto from "crypto"
import path from "path"

import ImageKit, { toFile } from "@imagekit/nodejs"

/** @returns {ImageKit} */
export function getImageKitClient() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not configured")
  }
  return new ImageKit({ privateKey })
}

/**
 * Server-controlled unique filename (never trust the raw original name as the storage key).
 * @param {string} [originalName]
 */
export function uniqueUploadFileName(originalName = "upload.jpg") {
  const base = path.basename(originalName || "upload.jpg")
  const ext = (path.extname(base).toLowerCase() || ".jpg").replace(/[^\w.]/g, "") || ".jpg"
  const allowedExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"])
  const safeExt = allowedExt.has(ext) ? ext : ".jpg"
  return `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExt}`
}

/**
 * Upload an in-memory image buffer to ImageKit.
 * @param {Buffer} buffer
 * @param {string} [originalName]
 * @param {string} [folder]
 * @returns {Promise<{ url: string, fileId?: string, name?: string }>}
 */
export async function uploadImageBuffer(buffer, originalName = "upload.jpg", folder = "/xivi/posts") {
  const client = getImageKitClient()
  const fileName = uniqueUploadFileName(originalName)
  const file = await toFile(buffer, fileName)

  return client.files.upload({
    file,
    fileName,
    folder,
  })
}
