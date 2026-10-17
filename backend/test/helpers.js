import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import request from "supertest"

import { createApp } from "../app.js"

let mongo
let app

/** Start in-memory Mongo + Express app for integration tests. */
export async function startTestApp() {
  process.env.NODE_ENV = "test"
  process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "test-access-secret"
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-secret"
  process.env.FRONTEND_URL = "http://localhost:3000"

  mongo = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongo.getUri()
  await mongoose.connect(process.env.MONGODB_URI)
  app = createApp()
  return app
}

export async function stopTestApp() {
  await mongoose.disconnect()
  if (mongo) await mongo.stop()
  app = null
  mongo = null
}

export function getApp() {
  if (!app) throw new Error("Test app not started")
  return app
}

export const VALID_PASSWORD = "Abcdef1!"

export async function registerUser(overrides = {}) {
  const body = {
    firstName: "Test",
    lastName: "User",
    email: `user_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`,
    password: VALID_PASSWORD,
    ...overrides,
  }
  const res = await request(getApp()).post("/auth/register").send(body)
  return { res, body }
}

export function authHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` }
}
