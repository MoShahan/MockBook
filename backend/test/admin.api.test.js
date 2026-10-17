import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import { authHeader, getApp, registerUser, startTestApp, stopTestApp, VALID_PASSWORD } from "./helpers.js"

describe("admin moderation API", () => {
  let adminToken
  let userToken
  let userId
  let postId
  let commentId

  before(async () => {
    process.env.ADMIN_EMAILS = "admin-test@example.com"
    await startTestApp()

    const admin = await registerUser({
      email: "admin-test@example.com",
      firstName: "Ada",
      lastName: "Admin",
      password: VALID_PASSWORD,
    })
    assert.equal(admin.res.status, 201, JSON.stringify(admin.res.body))
    assert.equal(admin.res.body.user.role, "admin")
    adminToken = admin.res.body.accessToken

    const user = await registerUser({
      email: "member-test@example.com",
      firstName: "Mem",
      lastName: "Ber",
      password: VALID_PASSWORD,
    })
    assert.equal(user.res.status, 201)
    assert.equal(user.res.body.user.role || "user", "user")
    userToken = user.res.body.accessToken
    userId = user.res.body.user._id

    const post = await request(getApp())
      .post("/posts")
      .set(authHeader(userToken))
      .send({ description: "Please moderate me" })
    assert.equal(post.status, 201)
    postId = post.body.post._id

    const comment = await request(getApp())
      .post(`/posts/${postId}/comments`)
      .set(authHeader(userToken))
      .send({ text: "A comment" })
    assert.equal(comment.status, 201)
    commentId = comment.body.updatedPost.comments[0]._id
  })

  after(async () => {
    await stopTestApp()
    delete process.env.ADMIN_EMAILS
  })

  it("allows admin to delete another user's comment and post", async () => {
    const delComment = await request(getApp())
      .delete(`/posts/${postId}/comments/${commentId}`)
      .set(authHeader(adminToken))
    assert.equal(delComment.status, 200, JSON.stringify(delComment.body))

    const delPost = await request(getApp()).delete(`/posts/${postId}`).set(authHeader(adminToken))
    assert.equal(delPost.status, 200)
  })

  it("forbids non-admin from deactivating users", async () => {
    const res = await request(getApp())
      .post(`/users/${userId}/deactivate`)
      .set(authHeader(userToken))
    assert.equal(res.status, 403)
  })

  it("lets admin deactivate a user and blocks their login", async () => {
    const other = await registerUser({
      email: "to-ban@example.com",
      firstName: "Ban",
      lastName: "Meplease",
      password: VALID_PASSWORD,
    })
    assert.equal(other.res.status, 201)
    const banId = other.res.body.user._id

    const deactivated = await request(getApp())
      .post(`/users/${banId}/deactivate`)
      .set(authHeader(adminToken))
    assert.equal(deactivated.status, 200)
    assert.equal(deactivated.body.user.isActive, false)

    const login = await request(getApp())
      .post("/auth/login")
      .send({ email: "to-ban@example.com", password: VALID_PASSWORD })
    assert.equal(login.status, 403)
  })
})
