import { describe, expect, it } from "vitest"

import { loginSchema, registerSchema } from "./authSchemas"
import { isValidPassword } from "./password"

describe("isValidPassword", () => {
  it("accepts a compliant password", () => {
    expect(isValidPassword("Abcdef1!")).toBe(true)
  })

  it("rejects weak passwords", () => {
    expect(isValidPassword("short1!")).toBe(false)
    expect(isValidPassword("abcdefgh1!")).toBe(false)
  })
})

describe("loginSchema", () => {
  it("requires email and password", async () => {
    await expect(loginSchema.validate({ email: "", password: "" })).rejects.toBeTruthy()
    await expect(
      loginSchema.validate({ email: "a@b.com", password: "x" })
    ).resolves.toMatchObject({ email: "a@b.com", password: "x" })
  })

  it("rejects invalid email", async () => {
    await expect(loginSchema.validate({ email: "nope", password: "x" })).rejects.toBeTruthy()
  })
})

describe("registerSchema", () => {
  it("accepts a valid registration payload", async () => {
    const values = {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      password: "Abcdef1!",
      cPassword: "Abcdef1!",
    }
    await expect(registerSchema.validate(values)).resolves.toMatchObject(values)
  })

  it("accepts single-character names", async () => {
    await expect(
      registerSchema.validate({
        firstName: "Q",
        lastName: "A",
        email: "qa@example.com",
        password: "Abcdef1!",
        cPassword: "Abcdef1!",
      })
    ).resolves.toMatchObject({ firstName: "Q", lastName: "A" })
  })

  it("rejects empty names after trim", async () => {
    await expect(
      registerSchema.validate({
        firstName: "  ",
        lastName: "A",
        email: "blank@example.com",
        password: "Abcdef1!",
        cPassword: "Abcdef1!",
      })
    ).rejects.toBeTruthy()
  })

  it("rejects mismatched confirm password", async () => {
    await expect(
      registerSchema.validate({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "Abcdef1!",
        cPassword: "Abcdef2!",
      })
    ).rejects.toBeTruthy()
  })

  it("rejects weak password", async () => {
    await expect(
      registerSchema.validate({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        password: "password",
        cPassword: "password",
      })
    ).rejects.toBeTruthy()
  })
})
