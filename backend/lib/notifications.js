import Notification from "../models/Notification.js"

/**
 * Create a notification unless actor === recipient. Failures are logged, never thrown to callers.
 * @param {{ recipientId: string, actorId: string, type: string, postId?: string|null, commentId?: string|null }} opts
 */
export async function createNotification({ recipientId, actorId, type, postId = null, commentId = null }) {
  try {
    if (!recipientId || !actorId || !type) return
    if (String(recipientId) === String(actorId)) return

    await Notification.create({
      recipient: recipientId,
      actor: actorId,
      type,
      postId: postId || null,
      commentId: commentId || null,
      read: false,
    })
  } catch (err) {
    console.error("createNotification failed:", err.message)
  }
}
