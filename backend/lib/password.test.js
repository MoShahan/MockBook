import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { isValidPassword } from "./password.js"

describe("isValidPassword", () => {
  it("accepts a policy-compliant password", () => {
    assert.equal(isValidPassword("Abcdef1!"), true)
  })

  it("rejects short, missing character classes, or non-strings", () => {
    assert.equal(isValidPassword("Abc1!"), false)
    assert.equal(isValidPassword("abcdefgh1!"), false)
    assert.equal(isValidPassword("ABCDEFGH1!"), false)
    assert.equal(isValidPassword("Abcdefgh!"), false)
    assert.equal(isValidPassword("Abcdefgh1"), false)
    assert.equal(isValidPassword(""), false)
    assert.equal(isValidPassword(null), false)
  })
})
