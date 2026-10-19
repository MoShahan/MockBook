import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"

import request from "supertest"

import {
  authHeader,
  getApp,
  registerUser,
  startTestApp,
  stopTestApp,
  VALID_PASSWORD,
} from "./helpers.js"

describe("auth API", () => {
  before(async () => {
    await startTestApp()
  })

  after(async () => {
    await stopTestApp()
  })

  it("registers a user and returns tokens without password", async () => {
    const { res, body } = await registerUser({ email: "reg@example.com" })
    assert.equal(res.status, 201)
    assert.ok(res.body.accessToken)
    assert.ok(res.body.refreshToken)
    assert.equal(res.body.user.email, body.email)
    assert.equal(res.body.user.password, undefined)
  })

  it("rejects weak passwords on register", async () => {
    const res = await request(getApp()).post("/auth/register").send({
      firstName: "A",
      lastName: "B",
      email: "weak@example.com",
      password: "password",
    })
    assert.equal(res.status, 400)
  })

  it("allows single-character first and last names", async () => {
    const res = await request(getApp()).post("/auth/register").send({
      firstName: "Q",
      lastName: "A",
      email: "qa-name@example.com",
      password: VALID_PASSWORD,
    })
    assert.equal(res.status, 201)
    assert.equal(res.body.user.firstName, "Q")
    assert.equal(res.body.user.lastName, "A")
  })

  it("logs in with valid credentials and rejects bad password", async () => {
    const email = "login@example.com"
    await registerUser({ email })

    const ok = await request(getApp()).post("/auth/login").send({ email, password: VALID_PASSWORD })
    assert.equal(ok.status, 200)
    assert.ok(ok.body.accessToken)

    const bad = await request(getApp()).post("/auth/login").send({ email, password: "WrongPass1!" })
    assert.equal(bad.status, 400)
    assert.equal(bad.body.error, "Invalid credentials")
  })

  it("rejects protected routes without a token", async () => {
    const res = await request(getApp()).get("/auth/me")
    assert.equal(res.status, 401)
  })

  it("rejects invalid tokens", async () => {
    const res = await request(getApp()).get("/auth/me").set(authHeader("not-a-jwt"))
    assert.equal(res.status, 401)
  })

  it("returns current user with a valid access token", async () => {
    const { res: reg } = await registerUser({ email: "me@example.com" })
    const res = await request(getApp()).get("/auth/me").set(authHeader(reg.body.accessToken))
    assert.equal(res.status, 200)
    assert.equal(res.body.user.email, "me@example.com")
  })
})
