import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import { authHeader, getApp, registerUser, startTestApp, stopTestApp } from "./helpers.js"

describe("friends API", () => {
  let tokenA
  let tokenB
  let idB

  before(async () => {
    await startTestApp()
    const a = await registerUser({ email: "alice@example.com", firstName: "Alice", lastName: "Anderson" })
    const b = await registerUser({ email: "bob@example.com", firstName: "Bob", lastName: "Baker" })
    assert.equal(a.res.status, 201, a.res.body?.error || "Alice register failed")
    assert.equal(b.res.status, 201, b.res.body?.error || "Bob register failed")
    tokenA = a.res.body.accessToken
    tokenB = b.res.body.accessToken
    idB = b.res.body.user._id
  })

  after(async () => {
    await stopTestApp()
  })

  it("adds and removes a friend", async () => {
    const added = await request(getApp()).patch(`/users/friends/${idB}`).set(authHeader(tokenA))
    assert.equal(added.status, 200)
    assert.ok(added.body.friends.some(f => String(f._id) === String(idB)))

    const removed = await request(getApp()).patch(`/users/friends/${idB}`).set(authHeader(tokenA))
    assert.equal(removed.status, 200)
    assert.equal(
      removed.body.friends.some(f => String(f._id) === String(idB)),
      false
    )
  })

  it("requires auth to change friends", async () => {
    const res = await request(getApp()).patch(`/users/friends/${idB}`)
    assert.equal(res.status, 401)
  })

  it("keeps both users registered", async () => {
    const me = await request(getApp()).get("/auth/me").set(authHeader(tokenB))
    assert.equal(me.status, 200)
  })
})
