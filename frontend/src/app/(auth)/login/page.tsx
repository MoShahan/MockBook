"use client"

import React, { Suspense } from "react"
import { Typography } from "@mui/material"
import { useSearchParams } from "next/navigation"

import Form from "@/components/Form"
import { loginSchema } from "@/lib/authSchemas"
import { resolveOauthError } from "@/lib/oauthErrors"
import type { LoginFormValues } from "@/types/models"

const loginInitVals: LoginFormValues = {
  email: "",
  password: "",
}

function LoginFormWithOauth() {
  const searchParams = useSearchParams()
  const oauthError = resolveOauthError(searchParams.get("oauthError"))
  return (
    <>
      <Typography variant="h4" sx={{ mb: 0.75 }}>
        Welcome back
      </Typography>
      <Typography sx={{ color: "text.secondary", mb: 3, lineHeight: 1.5 }}>
        Sign in to continue to Xivi.
      </Typography>
      <Form
        initVals={loginInitVals}
        type="login"
        validationSchema={loginSchema}
        oauthError={oauthError}
      />
    </>
  )
}

const LoginPage = () => {
  return (
    <Suspense fallback={null}>
      <LoginFormWithOauth />
    </Suspense>
  )
}

export default LoginPage
