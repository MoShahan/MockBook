import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_AVATAR_COLOR,
  sanitizeProfileColor,
} from "./profileColors.js"

describe("sanitizeProfileColor", () => {
  it("accepts allowlisted hex (case-insensitive)", () => {
    assert.equal(sanitizeProfileColor("#314f3b"), "#314F3B")
    assert.equal(sanitizeProfileColor("314F3B"), "#314F3B")
  })

  it("rejects unknown or malformed colors", () => {
    assert.equal(sanitizeProfileColor("#FF0000"), null)
    assert.equal(sanitizeProfileColor("not-a-color"), null)
    assert.equal(sanitizeProfileColor(""), null)
    assert.equal(sanitizeProfileColor(null), null)
  })

  it("keeps default avatar in the allowlist", () => {
    assert.equal(sanitizeProfileColor(DEFAULT_AVATAR_COLOR), DEFAULT_AVATAR_COLOR.toUpperCase())
  })
})
