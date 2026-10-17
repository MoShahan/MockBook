export type SocialNetwork = "facebook" | "x" | "linkedin" | "instagram"

export const SOCIAL_NETWORKS: { key: SocialNetwork; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "instagram", label: "Instagram" },
]

/** Build profile URL from a stored handle (already sanitized server-side). */
export function socialProfileUrl(network: SocialNetwork, handle: string | undefined | null): string | null {
  const h = (handle || "").trim().replace(/^@+/, "")
  if (!h) return null
  const enc = encodeURIComponent(h)
  switch (network) {
    case "facebook":
      return `https://facebook.com/${enc}`
    case "x":
      return `https://x.com/${enc}`
    case "linkedin":
      return `https://www.linkedin.com/in/${enc}`
    case "instagram":
      return `https://instagram.com/${enc}`
    default:
      return null
  }
}
