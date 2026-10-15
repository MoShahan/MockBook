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
 * Upload an in-memory image buffer to ImageKit.
 * @param {Buffer} buffer
 * @param {string} [originalName]
 * @param {string} [folder]
 * @returns {Promise<{ url: string, fileId?: string, name?: string }>}
 */
export async function uploadImageBuffer(buffer, originalName = "upload.jpg", folder = "/mockbook/posts") {
  const client = getImageKitClient()
  const safeName = originalName.replace(/[^\w.\-]+/g, "_") || `upload-${Date.now()}.jpg`
  const file = await toFile(buffer, safeName)

  return client.files.upload({
    file,
    fileName: safeName,
    folder,
  })
}
