"use client"

import React from "react"
import { Typography } from "@mui/material"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import Form from "@/components/Form"
import { isValidPassword, PASSWORD_POLICY_MESSAGE } from "@/lib/password"
import type { RegisterFormValues } from "@/types/models"

const registerSchema: ObjectSchema<RegisterFormValues> = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
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

const registerInitVals: RegisterFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  cPassword: "",
}

const RegisterPage = () => {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 0.75 }}>
        Create your account
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3, lineHeight: 1.5 }}>
        Just a few details - you can add more on your profile later.
      </Typography>
      <Form initVals={registerInitVals} type="register" validationSchema={registerSchema} />
    </>
  )
}

export default RegisterPage
