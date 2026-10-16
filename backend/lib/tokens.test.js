import assert from "node:assert/strict"
import { before, describe, it } from "node:test"

import {
  issueAuthTokens,
  verifyAccessTokenString,
  verifyRefreshTokenString,
} from "./tokens.js"

before(() => {
  process.env.ACCESS_TOKEN_SECRET = "test-access-secret"
  process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret"
})

describe("auth tokens", () => {
  it("issues access + refresh tokens that verify with the correct type", () => {
    const { accessToken, refreshToken } = issueAuthTokens("507f1f77bcf86cd799439011")
    const access = verifyAccessTokenString(accessToken)
    const refresh = verifyRefreshTokenString(refreshToken)
    assert.equal(access.id, "507f1f77bcf86cd799439011")
    assert.notEqual(access.typ, "refresh")
    assert.equal(refresh.id, "507f1f77bcf86cd799439011")
    assert.equal(refresh.typ, "refresh")
  })

  it("rejects a refresh token as an access token", () => {
    const { refreshToken } = issueAuthTokens("507f1f77bcf86cd799439011")
    assert.throws(() => verifyAccessTokenString(refreshToken))
  })
})
