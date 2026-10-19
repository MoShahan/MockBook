/** Max post description length (grapheme clusters). Keep in sync with frontend `postLimits.ts`. */
export const POST_DESCRIPTION_MAX = 5000

/** Count user-visible characters (Unicode grapheme clusters). */
export function graphemeLength(text) {
  if (!text) return 0
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
    let count = 0
    for (const _ of segmenter.segment(text)) count += 1
    return count
  }
  return Array.from(text).length
}
