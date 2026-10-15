"use client"

import React from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

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

const LoginPage = () => {
  const theme = useTheme()
  const alt = theme.palette.background.alt

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")

  return (
    <Box>
      <Box sx={{ width: "100%", bgcolor: alt, p: "1rem 6%", textAlign: "center" }}>
        <Typography sx={{ fontWeight: "bold", fontSize: "32px", color: "primary" }}>MERN - Social Media</Typography>
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
          Welcome to My Social Media App
        </Typography>
        <Form initVals={loginInitVals} type="login" validationSchema={loginSchema} />
      </Box>
    </Box>
  )
}

export default LoginPage
