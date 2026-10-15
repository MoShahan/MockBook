import User from "../models/User.js"

export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    res.status(200).json(user)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const getUserFriends = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    const friends = await Promise.all(user.friends.map(id => User.findById(id)))
    const formattedFriends = friends.map(({ _id, firstName, lastName, occupation, location, picturePath }) => ({
      id: _id,
      firstName,
      lastName,
      occupation,
      location,
      url: picturePath,
    }))
    res.status(200).json(formattedFriends)
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}

export const addRemoveFriend = async (req, res, next) => {
  try {
    const { id, friendId } = req.params
    const user = await User.findById(id)
    const friend = await User.findById(friendId)
    let message = ""

    if (user.friends.includes(friendId)) {
      // REMOVE
      user.friends = user.friends.filter(id => id !== friendId)
      friend.friends = friend.friends.filter(u_id => u_id !== id)
      message = "your friend has been removed"
    } else {
      // ADD
      user.friends.push(friendId)
      friend.friends.push(id)
      message = "new friend has been added"
    }

    await user.save()
    await friend.save()

    const friends = await Promise.all(user.friends.map(id => User.findById(id)))
    const formattedFriends = friends.map(({ _id, firstName, lastName, occupation, location, picturePath }) => ({
      id: _id,
      firstName,
      lastName,
      occupation,
      location,
      url: picturePath,
    }))
    res.status(200).json({ message, friends: formattedFriends })
  } catch (e) {
    res.status(404).json({ msg: e.message })
  }
}
