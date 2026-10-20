import { describe, expect, it } from "vitest"

import { resolveOauthError } from "./oauthErrors"

describe("resolveOauthError", () => {
  it("returns null for empty input", () => {
    expect(resolveOauthError(null)).toBeNull()
    expect(resolveOauthError("")).toBeNull()
    expect(resolveOauthError("   ")).toBeNull()
  })

  it("maps known codes to fixed copy", () => {
    expect(resolveOauthError("cancelled")).toBe("Sign-in was cancelled.")
    expect(resolveOauthError("no_email")).toMatch(/no email/i)
  })

  it("never echoes attacker-controlled free text", () => {
    expect(resolveOauthError("Visit https://evil.example to reset")).toBe(
      "Sign-in failed. Please try again."
    )
  })
})
