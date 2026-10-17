import type { AppNotification } from "@/types/notifications"

export function notificationCopy(n: AppNotification): string {
  const name = `${n.actor?.firstName || ""} ${n.actor?.lastName || ""}`.trim() || "Someone"
  switch (n.type) {
    case "post_like":
      return `${name} liked your post`
    case "comment":
      return `${name} commented on your post`
    case "comment_like":
      return `${name} liked your comment`
    case "friend":
      return `${name} added you as a friend`
    case "friend_request":
      return `${name} sent you a friend request`
    case "friend_accept":
      return `${name} accepted your friend request`
    default:
      return `${name} interacted with you`
  }
}

export function notificationHref(n: AppNotification): string | null {
  if (n.type === "friend_request") return "/friend-requests"
  if (n.postId) return `/post/${n.postId}`
  if (n.actor?._id) return `/profile/${n.actor._id}`
  return null
}
