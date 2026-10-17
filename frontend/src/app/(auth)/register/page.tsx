"use client"

import React from "react"
import { Typography } from "@mui/material"

import Form from "@/components/Form"
import { registerSchema } from "@/lib/authSchemas"
import type { RegisterFormValues } from "@/types/models"

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
