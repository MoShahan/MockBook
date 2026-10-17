import multer from "multer"

/** Central API error handler - no stack traces or secrets to clients. */
export function errorHandler(err, _req, res, _next) {
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5MB or smaller" : "Upload failed"
    return res.status(400).json({ error: msg })
  }

  if (err instanceof Error && err.message === "Only image uploads are allowed") {
    return res.status(400).json({ error: err.message })
  }

  if (err?.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origin not allowed" })
  }

  console.error(err)
  return res.status(err.status || err.statusCode || 500).json({
    error: err.expose ? err.message : "Internal server error",
  })
}
