"use client"

import React from "react"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import * as yup from "yup"

import Form from "@/components/Form"

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
  cPassword: yup.string().oneOf([yup.ref("password"), ""], "Passwords must match"),
  location: yup.string().required("required"),
  picture: yup.string().required("required"),
  occupation: yup.string().required("required"),
})

const registerInitVals = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  cPassword: "",
  location: "",
  picture: "",
  occupation: "",
}

const RegisterPage = () => {
  const theme: any = useTheme()
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
