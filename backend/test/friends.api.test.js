import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import { authHeader, getApp, registerUser, startTestApp, stopTestApp } from "./helpers.js"

describe("friend requests + follow API", () => {
  let tokenA
  let tokenB
  let idA
  let idB

  before(async () => {
    await startTestApp()
    const a = await registerUser({
      email: "alice-fr@example.com",
      firstName: "Alice",
      lastName: "Anderson",
    })
    const b = await registerUser({
      email: "bob-fr@example.com",
      firstName: "Bob",
      lastName: "Baker",
    })
    assert.equal(a.res.status, 201, a.res.body?.error || "Alice register failed")
    assert.equal(b.res.status, 201, b.res.body?.error || "Bob register failed")
    tokenA = a.res.body.accessToken
    tokenB = b.res.body.accessToken
    idA = a.res.body.user._id
    idB = b.res.body.user._id
  })

  after(async () => {
    await stopTestApp()
  })

  it("does not create friends without accept", async () => {
    const sent = await request(getApp())
      .post(`/users/${idB}/friend-requests`)
      .set(authHeader(tokenA))
    assert.equal(sent.status, 201, JSON.stringify(sent.body))
    assert.ok(sent.body.request?._id)

    const friendsA = await request(getApp()).get(`/users/${idA}/friends`).set(authHeader(tokenA))
    assert.equal(friendsA.status, 200)
    assert.equal(
      friendsA.body.some(f => String(f._id) === String(idB)),
      false
    )

    const incoming = await request(getApp())
      .get("/users/me/friend-requests?box=incoming")
      .set(authHeader(tokenB))
    assert.equal(incoming.status, 200)
    assert.equal(incoming.body.requests.length, 1)
  })

  it("accept is mutual; decline leaves neither as friends", async () => {
    const list = await request(getApp())
      .get("/users/me/friend-requests?box=incoming")
      .set(authHeader(tokenB))
    const requestId = list.body.requests[0]._id

    const accepted = await request(getApp())
      .post(`/users/me/friend-requests/${requestId}/accept`)
      .set(authHeader(tokenB))
    assert.equal(accepted.status, 200, JSON.stringify(accepted.body))
    assert.ok(accepted.body.friends.some(f => String(f._id) === String(idA)))

    const friendsA = await request(getApp()).get(`/users/${idA}/friends`).set(authHeader(tokenA))
    assert.ok(friendsA.body.some(f => String(f._id) === String(idB)))

    const unfriended = await request(getApp())
      .delete(`/users/me/friends/${idB}`)
      .set(authHeader(tokenA))
    assert.equal(unfriended.status, 200)

    const sent2 = await request(getApp())
      .post(`/users/${idB}/friend-requests`)
      .set(authHeader(tokenA))
    assert.equal(sent2.status, 201)
    const reqId2 = sent2.body.request._id

    const declined = await request(getApp())
      .post(`/users/me/friend-requests/${reqId2}/decline`)
      .set(authHeader(tokenB))
    assert.equal(declined.status, 200)

    const friendsAfter = await request(getApp())
      .get(`/users/${idA}/friends`)
      .set(authHeader(tokenA))
    assert.equal(
      friendsAfter.body.some(f => String(f._id) === String(idB)),
      false
    )
  })

  it("follow is one-way; target following unchanged", async () => {
    const follow = await request(getApp()).post(`/users/${idB}/follow`).set(authHeader(tokenA))
    assert.equal(follow.status, 200)
    assert.equal(follow.body.isFollowing, true)
    assert.ok(follow.body.following.includes(String(idB)))

    const bFollowing = await request(getApp()).get("/users/me/following").set(authHeader(tokenB))
    assert.equal(bFollowing.status, 200)
    assert.equal(
      bFollowing.body.following.some(u => String(u._id) === String(idA)),
      false
    )

    const unfollow = await request(getApp()).delete(`/users/${idB}/follow`).set(authHeader(tokenA))
    assert.equal(unfollow.status, 200)
    assert.equal(unfollow.body.isFollowing, false)
  })

  it("rejects self friend/follow and unauthorized accept", async () => {
    const selfReq = await request(getApp())
      .post(`/users/${idA}/friend-requests`)
      .set(authHeader(tokenA))
    assert.equal(selfReq.status, 400)

    const selfFollow = await request(getApp()).post(`/users/${idA}/follow`).set(authHeader(tokenA))
    assert.equal(selfFollow.status, 400)

    const sent = await request(getApp())
      .post(`/users/${idB}/friend-requests`)
      .set(authHeader(tokenA))
    assert.equal(sent.status, 201)
    const reqId = sent.body.request._id

    const badAccept = await request(getApp())
      .post(`/users/me/friend-requests/${reqId}/accept`)
      .set(authHeader(tokenA))
    assert.equal(badAccept.status, 403)

    await request(getApp()).delete(`/users/me/friend-requests/${reqId}`).set(authHeader(tokenA))
  })

  it("personal feed includes followed users' posts even when not friends", async () => {
    const c = await registerUser({
      email: "cara-fr@example.com",
      firstName: "Cara",
      lastName: "Carter",
    })
    assert.equal(c.res.status, 201)
    const tokenC = c.res.body.accessToken
    const idC = c.res.body.user._id

    const post = await request(getApp())
      .post("/posts")
      .set(authHeader(tokenC))
      .send({ description: "Cara shared something interesting" })
    assert.equal(post.status, 201, JSON.stringify(post.body))

    await request(getApp()).post(`/users/${idC}/follow`).set(authHeader(tokenA))

    const feed = await request(getApp())
      .get("/posts")
      .query({ scope: "friends", limit: 20 })
      .set(authHeader(tokenA))
    assert.equal(feed.status, 200)
    assert.ok(
      feed.body.posts.some(p => String(p.userId) === String(idC)),
      "expected Cara's post in Alice network feed"
    )
  })

  it("requires auth for relationship mutations", async () => {
    const res = await request(getApp()).post(`/users/${idB}/friend-requests`)
    assert.equal(res.status, 401)
  })
})
