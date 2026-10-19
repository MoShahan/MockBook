/** Match planned backend post description cap (A2). */
export const POST_DESCRIPTION_MAX = 5000

export const POST_DESCRIPTION_MAX_LABEL = "5,000 characters"

export const POST_DESCRIPTION_LIMIT_REACHED = "Max limit reached"

/**
 * Count user-visible characters (Unicode grapheme clusters).
 * Complex emoji (e.g. 👨‍👩‍👧‍👦) count as 1, same as a letter.
 */
export function graphemeLength(text: string): number {
  if (!text) return 0
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    let count = 0
    for (const _ of segmenter.segment(text)) count += 1
    return count
  }
  // Fallback: code points (still better than UTF-16 `.length` for emoji)
  return Array.from(text).length
}

/** Truncate to at most `max` grapheme clusters. */
export function truncateGraphemes(text: string, max: number): string {
  if (!text || max <= 0) return ""
  if (graphemeLength(text) <= max) return text

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    let out = ""
    let count = 0
    for (const { segment } of segmenter.segment(text)) {
      if (count >= max) break
      out += segment
      count += 1
    }
    return out
  }

  return Array.from(text).slice(0, max).join("")
}
