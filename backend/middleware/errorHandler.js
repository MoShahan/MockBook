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

  // Mongoose schema validation (e.g. name length) → clear 400 for the client.
  if (err?.name === "ValidationError" && err.errors) {
    const first = Object.values(err.errors)[0]
    const msg =
      first && typeof first === "object" && "message" in first && typeof first.message === "string"
        ? first.message
        : "Invalid input"
    return res.status(400).json({ error: msg })
  }

  const status = err.status || err.statusCode || 500
  // Client-facing errors (validation, feature flags) - no stack noise in logs.
  if (err.expose && status < 500) {
    return res.status(status).json({ error: err.message })
  }

  console.error(err)
  return res.status(status).json({
    error: "Internal server error",
  })
}
