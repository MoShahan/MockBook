import { describe, expect, it } from "vitest"

import { graphemeLength, POST_DESCRIPTION_MAX, truncateGraphemes } from "./postLimits"

describe("graphemeLength", () => {
  it("counts ASCII one-to-one", () => {
    expect(graphemeLength("hello")).toBe(5)
  })

  it("counts a complex emoji as one character", () => {
    expect(graphemeLength("👨‍👩‍👧‍👦")).toBe(1)
  })
})

describe("truncateGraphemes", () => {
  it("keeps text under the max grapheme count", () => {
    const long = "a".repeat(POST_DESCRIPTION_MAX + 50)
    expect(graphemeLength(truncateGraphemes(long, POST_DESCRIPTION_MAX))).toBe(POST_DESCRIPTION_MAX)
  })
})
