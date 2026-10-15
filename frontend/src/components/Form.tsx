"use client"

import React from "react"
import { EditOutlined } from "@mui/icons-material"
import { Box, Button, TextField, Typography, useMediaQuery, useTheme } from "@mui/material"
import { Formik, FormikHelpers } from "formik"
import { useRouter } from "next/navigation"
import Dropzone from "react-dropzone"
import * as yup from "yup"

import { useAppDispatch } from "@/app/hooks"
import { setLogin } from "@/state"

import FlexBetween from "./FlexBetween"

type FormProps = { type: "login" | "register"; validationSchema: any; initVals: any }

const Form = ({ type, validationSchema, initVals }: FormProps) => {
  const router = useRouter()
  const { palette }: any = useTheme()
  const dispatch = useAppDispatch()
  const isNonMobile = useMediaQuery("(min-width:600px)")
  const isLogin = type === "login"
  const isRegister = type === "register"

  const handleGoToLogin = () => {
    router.push("/login")
  }

  const handleGoToRegister = () => {
    router.push("/register")
  }

  const handleGoToHome = () => {
    router.push("/home")
  }

  const login = async (vals: any, onSubmitProps: FormikHelpers<any>) => {
    const response = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vals),
    })
    const res = await response.json()
    onSubmitProps.resetForm()

    if (res) {
      dispatch(setLogin({ user: res.user, accessToken: res.accessToken }))
      handleGoToHome()
    }
  }

  const register = async (vals: any, onSubmitProps: FormikHelpers<any>) => {
    const formData = new FormData() // to send image also
    for (let value in vals) {
      formData.append(value, vals[value])
    }
    formData.append("picture", vals.picture.name)
    // formData.append("url", vals.picture.name)

    const response = await fetch("http://localhost:5000/auth/register", { method: "POST", body: formData })
    const res = await response.json()
    onSubmitProps.resetForm()

    if (res) {
      handleGoToLogin()
    }
  }

  const handleFormSubmit = async (vals: any, onSubmitProps: FormikHelpers<any>) => {
    if (isLogin) await login(vals, onSubmitProps)
    if (isRegister) await register(vals, onSubmitProps)
  }

  return (
    <Formik onSubmit={handleFormSubmit} initialValues={initVals} validationSchema={validationSchema}>
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }: any) => (
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gap: "30px",
              gridTemplateColumns: "repeat(4,minmax(0,1fr))",
              "& > div": {
                gridColumn: isNonMobile ? undefined : "span 4",
              },
            }}
          >
            {isRegister && (
              <>
                <TextField
                  label="First Name"
                  name="firstName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.firstName}
                  error={Boolean(touched.firstName) && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.lastName}
                  error={Boolean(touched.lastName) && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  label="Location"
                  name="location"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.location}
                  error={Boolean(touched.location) && Boolean(errors.location)}
                  helperText={touched.location && errors.location}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  label="Occupation"
                  name="occupation"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.occupation}
                  error={Boolean(touched.occupation) && Boolean(errors.occupation)}
                  helperText={touched.occupation && errors.occupation}
                  sx={{ gridColumn: "span 4" }}
                />
                <Box
                  sx={{
                    gridColumn: "span 4",
                    p: "1rem",
                    borderRadius: "4px",
                    border: `1px solid ${palette.neutral.medium}`,
                  }}
                >
                  <Dropzone multiple={false} onDrop={acceptedFiles => setFieldValue("picture", acceptedFiles[0])}>
                    {({ getRootProps, getInputProps }) => (
                      <Box
                        {...getRootProps()}
                        sx={{
                          border: `2px dashed ${palette.primary.main}`,
                          p: "1rem",
                          "&:hover": { cursor: "pointer" },
                        }}
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <p>Add photo here</p>
                        ) : (
                          <FlexBetween>
                            <Typography>{values.picture.name}</Typography>
                            <EditOutlined />
                          </FlexBetween>
                        )}
                      </Box>
                    )}
                  </Dropzone>
                </Box>
              </>
            )}
            <TextField
              label="Email"
              sx={{ gridColumn: "span 4" }}
              type="email"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.email}
              error={Boolean(touched.email) && Boolean(errors.email)}
              helperText={touched.email && errors.email}
            />
            <TextField
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.password}
              error={Boolean(touched.password) && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              label="Password"
              sx={{ gridColumn: "span 4" }}
              type="password"
              name="password"
            />
            {isRegister && (
              <TextField
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.cPassword}
                error={Boolean(touched.cPassword) && Boolean(errors.cPassword)}
                helperText={touched.cPassword && errors.cPassword}
                label="Confirm Password"
                sx={{ gridColumn: "span 4" }}
                type="password"
                name="cPassword"
              />
            )}
          </Box>
          <Box>
            <Button
              fullWidth
              type="submit"
              sx={{
                m: "2rem 0",
                p: "1rem",
                backgroundColor: palette.primary.main,
                color: palette.background.alt,
                "&:hover": { color: palette.primary.main },
              }}
            >
              {isLogin ? "LOGIN" : "REGISTER"}
            </Button>
            {isLogin && (
              <Typography
                sx={{
                  textAlign: "center",
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: palette.primary.main,
                  "&:hover": {
                    color: palette.primary.light,
                  },
                }}
                onClick={handleGoToRegister}
              >
                New User? Click here to register
              </Typography>
            )}
            {isRegister && (
              <Typography
                sx={{
                  textAlign: "center",
                  cursor: "pointer",
                  textDecoration: "underline",
                  color: palette.primary.main,
                  "&:hover": {
                    color: palette.primary.light,
                  },
                }}
                onClick={handleGoToLogin}
              >
                Have an account already? Log In
              </Typography>
            )}
          </Box>
        </form>
      )}
    </Formik>
  )
}

export default Form
