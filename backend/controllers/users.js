import { formatFriendsList, toFriendId } from "../lib/friends.js"
import User from "../models/User.js"

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id).select("-password")
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }
    res.status(200).json(user)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getUserFriends = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }
    const formattedFriends = await formatFriendsList(user.friends)
    res.status(200).json(formattedFriends)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

/** Toggle friendship for the authenticated user (JWT) and `:friendId`. */
export const addRemoveFriend = async (req, res, next) => {
  try {
    const authUserId = req.user?.id
    if (!authUserId) {
      return res.status(401).json({ error: "Unauthenticated" })
    }

    const { friendId } = req.params
    if (!friendId) {
      return res.status(400).json({ error: "Friend id is required" })
    }

    if (String(authUserId) === String(friendId)) {
      return res.status(400).json({ error: "Cannot add yourself as a friend" })
    }

    const user = await User.findById(authUserId)
    const friend = await User.findById(friendId)
    if (!user || !friend) {
      return res.status(404).json({ msg: "User not found" })
    }

    let message = ""
    const alreadyFriend = user.friends.some(fid => toFriendId(fid) === String(friendId))

    if (alreadyFriend) {
      user.friends = user.friends.filter(fid => toFriendId(fid) !== String(friendId))
      friend.friends = friend.friends.filter(fid => toFriendId(fid) !== String(authUserId))
      message = "Friend removed"
    } else {
      user.friends.push(friend._id)
      friend.friends.push(user._id)
      message = "Friend added"
    }

    await user.save()
    await friend.save()

    const formattedFriends = await formatFriendsList(user.friends)
    res.status(200).json({ message, friends: formattedFriends })
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}
