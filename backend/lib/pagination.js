const DEFAULT_LIMIT = 10
const MAX_LIMIT = 30

/**
 * Parse feed pagination query: `?limit=` + optional `cursor` (ISO date of last item's createdAt).
 * @param {Record<string, unknown>} query
 */
export function parseCursorPagination(query = {}) {
  const rawLimit = Number.parseInt(String(query.limit ?? String(DEFAULT_LIMIT)), 10)
  const limit = Math.min(
    MAX_LIMIT,
    Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT
  )

  let cursorDate = null
  const cursor = typeof query.cursor === "string" ? query.cursor.trim() : ""
  if (cursor) {
    const d = new Date(cursor)
    if (!Number.isNaN(d.getTime())) cursorDate = d
  }

  return { limit, cursorDate }
}

/**
 * @param {import("mongoose").Document[] | object[]} docs
 * @param {number} limit
 */
export function pageFromDocs(docs, limit) {
  const hasMore = docs.length > limit
  const pageDocs = hasMore ? docs.slice(0, limit) : docs
  const last = pageDocs[pageDocs.length - 1]
  const createdAt = last?.createdAt
  const nextCursor =
    hasMore && createdAt ? new Date(createdAt).toISOString() : null
  return { pageDocs, nextCursor, hasMore }
}
