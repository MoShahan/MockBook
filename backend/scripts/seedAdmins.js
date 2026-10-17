/**
 * Upsert the three demo admin accounts (local/dev).
 * Usage (from repo root): npm run seed:admins -w backend
 * Requires MONGODB_URI and ACCESS_TOKEN_SECRET in backend/.env (secret unused here but keeps env consistent).
 */
import path from "path"
import { fileURLToPath } from "url"

import bcrypt from "bcrypt"
import dotenv from "dotenv"
import mongoose from "mongoose"

import { DEFAULT_ADMIN_EMAILS } from "../lib/admins.js"
import User from "../models/User.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

const DEMO_PASSWORD = "Admin@123"

const DEMO_ADMINS = [
  { email: "admin@yopmail.com", firstName: "Admin", lastName: "Yopmail" },
  { email: "admin@xivi.com", firstName: "Admin", lastName: "Xivi" },
  { email: "admin@mockbook.com", firstName: "Admin", lastName: "MockBook" },
]

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const salt = await bcrypt.genSalt()
  const hashed = await bcrypt.hash(DEMO_PASSWORD, salt)

  for (const row of DEMO_ADMINS) {
    const email = row.email.toLowerCase()
    let user = await User.findOne({ email }).select("+password")
    if (!user) {
      user = new User({
        firstName: row.firstName,
        lastName: row.lastName,
        email,
        password: hashed,
        role: "admin",
        isActive: true,
        friends: [],
        following: [],
        savedPosts: [],
      })
      await user.save()
      console.log(`Created admin ${email}`)
    } else {
      user.role = "admin"
      user.isActive = true
      user.deactivatedAt = null
      user.deactivatedBy = null
      user.password = hashed
      await user.save()
      console.log(`Updated admin ${email}`)
    }
  }

  console.log("Demo admins ready. Emails:", DEFAULT_ADMIN_EMAILS.join(", "))
  console.log("Password for all:", DEMO_PASSWORD)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
