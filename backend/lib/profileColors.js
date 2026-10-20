/** Allowlisted solid colors for avatar fallback + profile cover (no free-form hex). */
export const PROFILE_COLOR_HEXES = [
  "#314F3B", // forest
  "#4F7A5A", // olive
  "#57534E", // stone
  "#44403C", // charcoal
  "#0F766E", // teal
  "#1D4ED8", // blue
  "#6D28D9", // violet
  "#BE123C", // rose
  "#B45309", // amber
  "#0C0A09", // ink
]

export const DEFAULT_AVATAR_COLOR = "#314F3B"
export const DEFAULT_COVER_COLOR = "#57534E"

const ALLOWED = new Set(PROFILE_COLOR_HEXES.map(c => c.toUpperCase()))

/** @returns {string|null} normalized #RRGGBB or null if invalid */
export function sanitizeProfileColor(raw) {
  if (typeof raw !== "string") return null
  const trimmed = raw.trim().toUpperCase()
  const hex = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
  if (!/^#[0-9A-F]{6}$/.test(hex)) return null
  return ALLOWED.has(hex) ? hex : null
}
