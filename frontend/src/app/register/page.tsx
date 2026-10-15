"use client"

import React from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import type { ObjectSchema } from "yup"
import * as yup from "yup"

import Form from "@/components/Form"
import type { RegisterFormValues } from "@/types/models"

const registerSchema: ObjectSchema<RegisterFormValues> = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
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
        <Form initVals={registerInitVals} type="register" validationSchema={registerSchema} />
      </Box>
    </Box>
  )
}

export default RegisterPage
