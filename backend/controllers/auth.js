import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import User from "../models/User.js"

const toSafeUser = userDoc => {
  const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc }
  delete user.password
  return user
}

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const salt = await bcrypt.genSalt()
    const hashedPass = await bcrypt.hash(password, salt)

    // Profile fields (location, occupation, avatar) are set later in profile edit (Step 4.5 / ImageKit).
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPass,
      picturePath: "",
      friends: [],
      location: "",
      occupation: "",
      viewedProfile: 0,
      impressions: 0,
    })

    const savedUser = await newUser.save()

    res.status(201).json(toSafeUser(savedUser))
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

    res.send({ user: toSafeUser(user), accessToken })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
