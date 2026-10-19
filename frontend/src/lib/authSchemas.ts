import type { ObjectSchema } from "yup"
import * as yup from "yup"

import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password"
import type { LoginFormValues, RegisterFormValues } from "@/types/models"

export const loginSchema: ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
})

export const registerSchema: ObjectSchema<RegisterFormValues> = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .test("password-policy", PASSWORD_POLICY_MESSAGE, value => Boolean(value && isValidPassword(value))),
  cPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
})
