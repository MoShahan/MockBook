"use client"

import React from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import BrandLogo from "@/components/BrandLogo"
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
  const theme = useTheme()
  const alt = theme.palette.background.alt

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")

  return (
    <Box>
      <Box
        sx={{
          width: "100%",
          bgcolor: alt,
          p: "1rem 6%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <BrandLogo size="auth" />
      </Box>
      <Box
        sx={{
          width: isNonMobileScreens ? "50%" : "93%",
          p: "2rem",
          m: "2rem auto",
          borderRadius: "1.5rem",
          bgcolor: alt,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "500", mb: "1.5rem" }}>
          Join MockBook
        </Typography>
        <Form initVals={registerInitVals} type="register" validationSchema={registerSchema} />
      </Box>
    </Box>
  )
}

export default RegisterPage
