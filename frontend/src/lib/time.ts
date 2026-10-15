/** Human-readable time for post cards (relative when recent, else short date). */
export function formatPostTime(iso: string | Date | undefined | null): string {
  if (!iso) return ""
  const date = iso instanceof Date ? iso : new Date(iso)
  if (Number.isNaN(date.getTime())) return ""

  const diffMs = Date.now() - date.getTime()
  const sec = Math.round(diffMs / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  if (Math.abs(sec) < 60) return rtf.format(-sec, "second")
  if (Math.abs(min) < 60) return rtf.format(-min, "minute")
  if (Math.abs(hr) < 24) return rtf.format(-hr, "hour")
  if (Math.abs(day) < 7) return rtf.format(-day, "day")

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  })
}
