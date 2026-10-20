import { describe, expect, it } from "vitest"

import { formatCompactTime } from "./time"

describe("formatCompactTime", () => {
  it("returns empty string for missing dates", () => {
    expect(formatCompactTime(undefined)).toBe("")
    expect(formatCompactTime("not-a-date")).toBe("")
  })

  it("uses compact units for recent times", () => {
    const now = Date.now()
    expect(formatCompactTime(new Date(now - 10_000))).toBe("now")
    expect(formatCompactTime(new Date(now - 45 * 60_000))).toBe("45m")
    expect(formatCompactTime(new Date(now - 3 * 60 * 60_000))).toBe("3h")
    expect(formatCompactTime(new Date(now - 2 * 24 * 60 * 60_000))).toBe("2d")
  })
})
