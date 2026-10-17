import jwt from "jsonwebtoken"

const DEFAULT_ACCESS_TOKEN_EXPIRES = "1d"
const DEFAULT_REFRESH_TOKEN_EXPIRES = "7d"

export function getAccessTokenExpires() {
  return process.env.ACCESS_TOKEN_EXPIRES?.trim() || DEFAULT_ACCESS_TOKEN_EXPIRES
}

export function getRefreshTokenExpires() {
  return process.env.REFRESH_TOKEN_EXPIRES?.trim() || DEFAULT_REFRESH_TOKEN_EXPIRES
}

function requireAccessSecret() {
  const secret = process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured")
  }
  return secret
}

function requireRefreshSecret() {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    throw new Error("REFRESH_TOKEN_SECRET is not configured")
  }
  return secret
}

export function signAccessToken(userId) {
  return jwt.sign({ id: String(userId), typ: "access" }, requireAccessSecret(), {
    expiresIn: getAccessTokenExpires(),
  })
}

export function signRefreshToken(userId) {
  return jwt.sign({ id: String(userId), typ: "refresh" }, requireRefreshSecret(), {
    expiresIn: getRefreshTokenExpires(),
  })
}

export function verifyAccessTokenString(token) {
  const payload = jwt.verify(token, requireAccessSecret())
  if (!payload?.id || payload.typ === "refresh") {
    throw new Error("Invalid access token")
  }
  return payload
}

export function verifyRefreshTokenString(token) {
  const payload = jwt.verify(token, requireRefreshSecret())
  if (!payload?.id || payload.typ !== "refresh") {
    throw new Error("Invalid refresh token")
  }
  return payload
}

export function issueAuthTokens(userId) {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  }
}
