/** Allowlisted solid colors for avatar fallback + profile cover (must match backend). */
export type ProfileColor = {
  hex: string
  label: string
}

export const PROFILE_COLORS: readonly ProfileColor[] = [
  { hex: "#314F3B", label: "Forest" },
  { hex: "#4F7A5A", label: "Olive" },
  { hex: "#57534E", label: "Stone" },
  { hex: "#44403C", label: "Charcoal" },
  { hex: "#0F766E", label: "Teal" },
  { hex: "#1D4ED8", label: "Blue" },
  { hex: "#6D28D9", label: "Violet" },
  { hex: "#BE123C", label: "Rose" },
  { hex: "#B45309", label: "Amber" },
  { hex: "#0C0A09", label: "Ink" },
] as const

export const DEFAULT_AVATAR_COLOR = "#314F3B"
export const DEFAULT_COVER_COLOR = "#57534E"

const ALLOWED = new Set(PROFILE_COLORS.map(c => c.hex.toUpperCase()))

export function normalizeProfileColor(raw: string | undefined | null, fallback: string): string {
  if (!raw) return fallback
  const hex = (raw.startsWith("#") ? raw : `#${raw}`).toUpperCase()
  return ALLOWED.has(hex) ? hex : fallback
}
