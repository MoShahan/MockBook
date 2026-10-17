/**
 * Admin allowlist from ADMIN_EMAILS (comma-separated).
 * No hardcoded emails — leave unset for an empty allowlist (no auto-promotion).
 */

/**
 * @returns {Set<string>} lowercased emails
 */
export function getAdminEmailSet() {
  const raw = process.env.ADMIN_EMAILS?.trim()
  if (!raw) return new Set()
  return new Set(
    raw
      .split(",")
      .map(s => s.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAdminEmail(email) {
  if (!email || typeof email !== "string") return false
  return getAdminEmailSet().has(email.trim().toLowerCase())
}

/** Apply admin role when email is on the allowlist; never demote via this helper. */
export function roleForEmail(email, currentRole = "user") {
  if (isAdminEmail(email)) return "admin"
  return currentRole === "admin" ? "admin" : "user"
}

export function isAdminUser(userOrReqUser) {
  return userOrReqUser?.role === "admin"
}
