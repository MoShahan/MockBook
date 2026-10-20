import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import { FEATURE_DISABLED_ERROR, invalidateFeaturesCache } from "../lib/features.js"

import {
  authHeader,
  getApp,
  registerUser,
  startTestApp,
  stopTestApp,
  VALID_PASSWORD,
} from "./helpers.js"

describe("site feature settings API", () => {
  let adminToken
  let userToken

  before(async () => {
    process.env.ADMIN_EMAILS = "feat-admin@example.com"
    await startTestApp()
    invalidateFeaturesCache()

    const adminReg = await registerUser({
      email: "feat-admin@example.com",
      firstName: "Feat",
      lastName: "Admin",
      password: VALID_PASSWORD,
    })
    assert.equal(adminReg.res.status, 201, JSON.stringify(adminReg.res.body))
    const adminLogin = await request(getApp())
      .post("/auth/login")
      .send({ email: "feat-admin@example.com", password: VALID_PASSWORD })
    assert.equal(adminLogin.status, 200)
    assert.equal(adminLogin.body.user.role, "admin")
    adminToken = adminLogin.body.accessToken

    const user = await registerUser({
      email: "feat-user@example.com",
      firstName: "Feat",
      lastName: "User",
      password: VALID_PASSWORD,
    })
    assert.equal(user.res.status, 201)
    userToken = user.res.body.accessToken
  })

  after(async () => {
    await stopTestApp()
    delete process.env.ADMIN_EMAILS
    invalidateFeaturesCache()
  })

  it("GET /settings/features works for a normal user (defaults all true)", async () => {
    const res = await request(getApp()).get("/settings/features").set(authHeader(userToken))
    assert.equal(res.status, 200)
    assert.equal(res.body.features.postsCreate, true)
    assert.equal(res.body.features.postsImages, true)
    assert.equal(res.body.features.commentsCreate, true)
  })

  it("PATCH /settings/features is forbidden for non-admin", async () => {
    const res = await request(getApp())
      .patch("/settings/features")
      .set(authHeader(userToken))
      .send({ features: { postsCreate: false } })
    assert.equal(res.status, 403)
  })

  it("rejects unknown feature keys", async () => {
    const res = await request(getApp())
      .patch("/settings/features")
      .set(authHeader(adminToken))
      .send({ features: { notARealFlag: false } })
    assert.equal(res.status, 400)
  })

  it("admin can disable postsCreate/postsImages/commentsCreate; user is blocked; admin still works", async () => {
    const patched = await request(getApp())
      .patch("/settings/features")
      .set(authHeader(adminToken))
      .send({
        features: {
          postsCreate: false,
          postsImages: false,
          commentsCreate: false,
        },
      })
    assert.equal(patched.status, 200, JSON.stringify(patched.body))
    assert.equal(patched.body.features.postsCreate, false)
    assert.equal(patched.body.features.commentsCreate, false)

    const userPost = await request(getApp())
      .post("/posts")
      .set(authHeader(userToken))
      .send({ description: "Should fail" })
    assert.equal(userPost.status, 403)
    assert.equal(userPost.body.error, FEATURE_DISABLED_ERROR)

    const adminPost = await request(getApp())
      .post("/posts")
      .set(authHeader(adminToken))
      .send({ description: "Admin can still post" })
    assert.equal(adminPost.status, 201, JSON.stringify(adminPost.body))
    const postId = adminPost.body.post._id

    const userComment = await request(getApp())
      .post(`/posts/${postId}/comments`)
      .set(authHeader(userToken))
      .send({ text: "Nope" })
    assert.equal(userComment.status, 403)
    assert.equal(userComment.body.error, FEATURE_DISABLED_ERROR)

    const adminComment = await request(getApp())
      .post(`/posts/${postId}/comments`)
      .set(authHeader(adminToken))
      .send({ text: "Admin comment ok" })
    assert.equal(adminComment.status, 201)

    // Restore defaults for any later suites sharing process (fresh DB per file though).
    await request(getApp())
      .patch("/settings/features")
      .set(authHeader(adminToken))
      .send({
        features: {
          postsCreate: true,
          postsImages: true,
          commentsCreate: true,
        },
      })
  })
})
