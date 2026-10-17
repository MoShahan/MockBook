/**
 * Upsert admin accounts from local env (never hardcode credentials in the repo).
 * Usage (from repo root): npm run seed:admins -w backend
 *
 * Requires in backend/.env:
 *   MONGODB_URI
 *   ADMIN_EMAILS=comma,separated,emails
 *   ADMIN_PASSWORD=shared-password-for-seeded-accounts
 */
import path from "path"
import { fileURLToPath } from "url"

import bcrypt from "bcrypt"
import dotenv from "dotenv"
import mongoose from "mongoose"

import { getAdminEmailSet } from "../lib/admins.js"
import User from "../models/User.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, "../.env") })

function displayNameFromEmail(email) {
  const local = email.split("@")[0] || "admin"
  const parts = local.split(/[._-]+/).filter(Boolean)
  const firstName = parts[0] ? parts[0][0].toUpperCase() + parts[0].slice(1) : "Admin"
  const lastName = parts[1] ? parts[1][0].toUpperCase() + parts[1].slice(1) : "User"
  return { firstName, lastName }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is required in backend/.env")
    process.exit(1)
  }

  const emails = [...getAdminEmailSet()]
  const password = process.env.ADMIN_PASSWORD?.trim()

  if (emails.length === 0) {
    console.error("ADMIN_EMAILS is required in backend/.env (comma-separated)")
    process.exit(1)
  }
  if (!password) {
    console.error("ADMIN_PASSWORD is required in backend/.env")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const salt = await bcrypt.genSalt()
  const hashed = await bcrypt.hash(password, salt)

  for (const email of emails) {
    const { firstName, lastName } = displayNameFromEmail(email)
    let user = await User.findOne({ email }).select("+password")
    if (!user) {
      user = new User({
        firstName,
        lastName,
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

  console.log(`Seeded ${emails.length} admin(s) from ADMIN_EMAILS. Password set from ADMIN_PASSWORD.`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
