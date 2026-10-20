import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import { authHeader, getApp, registerUser, startTestApp, stopTestApp } from "./helpers.js"

describe("discover users API", () => {
  let tokenViewer
  let idViewer

  before(async () => {
    await startTestApp()
    const viewer = await registerUser({
      email: "viewer-discover@example.com",
      firstName: "Viewer",
      lastName: "One",
    })
    assert.equal(viewer.res.status, 201)
    tokenViewer = viewer.res.body.accessToken
    idViewer = String(viewer.res.body.user._id)

    for (let i = 0; i < 5; i += 1) {
      const u = await registerUser({
        email: `discover-user-${i}@example.com`,
        firstName: `Disc${i}`,
        lastName: "User",
      })
      assert.equal(u.res.status, 201)
    }
  })

  after(async () => {
    await stopTestApp()
  })

  it("paginates discover results without overlap and excludes self", async () => {
    const page1 = await request(getApp())
      .get("/users/discover")
      .query({ limit: 2 })
      .set(authHeader(tokenViewer))
    assert.equal(page1.status, 200)
    assert.equal(page1.body.users.length, 2)
    assert.equal(page1.body.hasMore, true)
    assert.ok(page1.body.nextCursor)
    assert.ok(page1.body.users[0].relationship)

    const page2 = await request(getApp())
      .get("/users/discover")
      .query({ limit: 2, cursor: page1.body.nextCursor })
      .set(authHeader(tokenViewer))
    assert.equal(page2.status, 200)
    assert.ok(page2.body.users.length >= 1)

    const allIds = [...page1.body.users, ...page2.body.users].map(u => String(u._id))
    assert.equal(new Set(allIds).size, allIds.length)
    assert.equal(allIds.includes(idViewer), false)
  })

  it("requires auth", async () => {
    const res = await request(getApp()).get("/users/discover")
    assert.equal(res.status, 401)
  })
})
