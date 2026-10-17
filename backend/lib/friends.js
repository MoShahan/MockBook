import User from "../models/User.js"

import { DEFAULT_AVATAR_COLOR } from "./profileColors.js"

/** Normalize a stored friend id (ObjectId or string) to a string. */
export const toFriendId = value => {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (typeof value === "object" && value._id != null) return String(value._id)
  return String(value)
}

/** Format a User doc into the client Friend shape. */
export const formatFriend = friend => {
  if (!friend) return null
  return {
    _id: String(friend._id),
    firstName: friend.firstName,
    lastName: friend.lastName,
    occupation: friend.occupation || "",
    location: friend.location || "",
    picturePath: friend.picturePath || "",
    avatarColor: friend.avatarColor || DEFAULT_AVATAR_COLOR,
  }
}

/** Resolve friend ids to formatted Friend objects (skips missing users). */
export const formatFriendsList = async friendIds => {
  const ids = (friendIds || []).map(toFriendId).filter(Boolean)
  if (!ids.length) return []

  const friends = await Promise.all(
    ids.map(id =>
      User.findById(id).select("firstName lastName occupation location picturePath avatarColor")
    )
  )
  return friends.map(formatFriend).filter(Boolean)
}
