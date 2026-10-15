import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import User from "../models/User.js"

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, picturePath, friends, location, occupation } = req.body
    const salt = await bcrypt.genSalt()
    const hashedPass = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPass,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: 0,
      impressions: 0,
    })

    const savedUser = await newUser.save()

    res.status(201).json(savedUser)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ msg: "Invalid credentials" })

    const passMatch = await bcrypt.compare(password, user.password)
    if (!passMatch) return res.status(400).json({ msg: "Invalid credentials" })

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET)

    delete user.password

    res.send({ user, accessToken })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
