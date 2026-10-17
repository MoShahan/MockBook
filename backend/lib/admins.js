/** Default demo admin emails (local/dev). Override with ADMIN_EMAILS env. */
export const DEFAULT_ADMIN_EMAILS = [
  "admin@yopmail.com",
  "admin@xivi.com",
  "admin@mockbook.com",
]

/**
 * @returns {Set<string>} lowercased emails
 */
export function getAdminEmailSet() {
  const raw = process.env.ADMIN_EMAILS?.trim()
  const list = raw
    ? raw
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)
    : DEFAULT_ADMIN_EMAILS.map(e => e.toLowerCase())
  return new Set(list)
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
