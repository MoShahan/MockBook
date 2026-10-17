const SOCIAL_KEYS = ["facebook", "x", "linkedin", "instagram"]

/**
 * Strip URLs/@ and keep a safe handle (letters, numbers, . _ -).
 * @param {unknown} raw
 * @returns {string}
 */
export function sanitizeSocialHandle(raw) {
  if (typeof raw !== "string") return ""
  let s = raw.trim()
  if (!s) return ""

  s = s.replace(/^@+/, "")
  s = s.replace(/^https?:\/\//i, "")
  s = s.replace(/^(www\.)?/i, "")
  s = s.replace(
    /^(facebook|fb|twitter|x|linkedin|instagram|instagr\.am)\.com\//i,
    ""
  )
  s = s.replace(/^in\//i, "") // linkedin.com/in/...
  s = s.split(/[/?#]/)[0] || ""
  s = s.replace(/[^a-zA-Z0-9._-]/g, "")
  return s.slice(0, 64)
}

/**
 * @param {Record<string, unknown>} body
 * @returns {{ facebook: string, x: string, linkedin: string, instagram: string }}
 */
export function pickSocialFields(body = {}) {
  const out = {}
  for (const key of SOCIAL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = sanitizeSocialHandle(body[key])
    }
  }
  return out
}

export function socialProfileUrl(network, handle) {
  const h = sanitizeSocialHandle(handle)
  if (!h) return null
  switch (network) {
    case "facebook":
      return `https://facebook.com/${encodeURIComponent(h)}`
    case "x":
      return `https://x.com/${encodeURIComponent(h)}`
    case "linkedin":
      return `https://www.linkedin.com/in/${encodeURIComponent(h)}`
    case "instagram":
      return `https://instagram.com/${encodeURIComponent(h)}`
    default:
      return null
  }
}

export { SOCIAL_KEYS }
