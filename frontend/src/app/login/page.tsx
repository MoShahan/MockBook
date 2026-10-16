"use client"

import React, { Suspense } from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import BrandLogo from "@/components/BrandLogo"
import Form from "@/components/Form"
import type { LoginFormValues } from "@/types/models"

const loginSchema: ObjectSchema<LoginFormValues> = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
})

const loginInitVals: LoginFormValues = {
  email: "",
  password: "",
}

function LoginFormWithOauth() {
  const searchParams = useSearchParams()
  const oauthError = searchParams.get("oauthError")
  return (
    <Form
      initVals={loginInitVals}
      type="login"
      validationSchema={loginSchema}
      oauthError={oauthError}
    />
  )
}

const LoginPage = () => {
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
          Welcome back to MockBook
        </Typography>
        <Suspense fallback={null}>
          <LoginFormWithOauth />
        </Suspense>
      </Box>
    </Box>
  )
}

export default LoginPage
