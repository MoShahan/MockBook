import mongoose from "mongoose"

export function isValidObjectId(id) {
  return Boolean(id) && mongoose.Types.ObjectId.isValid(String(id))
}

/** Express helper: 400 if param is not a valid ObjectId. */
export function requireObjectId(paramName = "id") {
  return (req, res, next) => {
    const value = req.params[paramName]
    if (!isValidObjectId(value)) {
      return res.status(400).json({ error: `Invalid ${paramName}` })
    }
    next()
  }
}
