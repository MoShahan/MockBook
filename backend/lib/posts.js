import User from "../models/User.js"

/**
 * Normalize Mongoose Map / plain likes to a plain object for JSON clients.
 * @param {unknown} likes
 * @returns {Record<string, boolean>}
 */
export function serializeLikes(likes) {
  if (!likes) return {}
  if (likes instanceof Map) {
    return Object.fromEntries(likes)
  }
  if (typeof likes === "object") {
    return { ...likes }
  }
  return {}
}

function authorSnapshot(author) {
  if (!author) return null
  return {
    firstName: author.firstName,
    lastName: author.lastName,
    location: author.location || "",
    picturePath: author.picturePath || "",
  }
}

function formatComment(comment, byId) {
  // Legacy bare string comments
  if (typeof comment === "string") {
    return {
      _id: undefined,
      userId: "",
      text: comment,
      createdAt: undefined,
      user: null,
    }
  }

  const raw = comment?.toObject ? comment.toObject() : comment
  return {
    _id: raw._id ? String(raw._id) : undefined,
    userId: raw.userId ? String(raw.userId) : "",
    text: raw.text || "",
    createdAt: raw.createdAt,
    user: authorSnapshot(byId[String(raw.userId)]),
  }
}

/**
 * Attach author snapshot (`user`) to each post and comment authors.
 * `Post.userId` is a string, not a ref.
 * @param {import("mongoose").Document[] | object[]} posts
 */
export async function withAuthors(posts) {
  const list = (Array.isArray(posts) ? posts : []).map(p => (p?.toObject ? p.toObject() : { ...p }))
  if (list.length === 0) return []

  const ids = new Set()
  for (const post of list) {
    if (post.userId) ids.add(String(post.userId))
    for (const c of post.comments || []) {
      if (c && typeof c === "object" && c.userId) ids.add(String(c.userId))
    }
  }

  const users = await User.find({ _id: { $in: [...ids] } })
    .select("firstName lastName location picturePath")
    .lean()

  const byId = Object.fromEntries(users.map(u => [String(u._id), u]))

  return list.map(post => {
    const author = byId[String(post.userId)]
    return {
      ...post,
      likes: serializeLikes(post.likes),
      comments: (post.comments || []).map(c => formatComment(c, byId)),
      user: authorSnapshot(author),
    }
  })
}
