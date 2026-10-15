"use client"

import React, { useState } from "react"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Formik, type FormikHelpers } from "formik"
import { useRouter } from "next/navigation"
import type { ObjectSchema } from "yup"

import { useAppDispatch } from "@/app/hooks"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { setLogin } from "@/state"
import type { LoginFormValues, RegisterFormValues, User } from "@/types/models"

type AuthFormValues = LoginFormValues | RegisterFormValues

type FormProps =
  | {
      type: "login"
      validationSchema: ObjectSchema<LoginFormValues>
      initVals: LoginFormValues
    }
  | {
      type: "register"
      validationSchema: ObjectSchema<RegisterFormValues>
      initVals: RegisterFormValues
    }

const Form = ({ type, validationSchema, initVals }: FormProps) => {
  const router = useRouter()
  const { palette } = useTheme()
  const dispatch = useAppDispatch()
  const isNonMobile = useMediaQuery("(min-width:600px)")
  const isLogin = type === "login"
  const isRegister = type === "register"

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleGoToLogin = () => {
    router.push("/login")
  }

  const handleGoToRegister = () => {
    router.push("/register")
  }

  const handleGoToHome = () => {
    router.push("/home")
  }

  const login = async (vals: LoginFormValues, onSubmitProps: FormikHelpers<LoginFormValues>) => {
    try {
      onSubmitProps.setStatus(undefined)
      const { data } = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        "/auth/login",
        {
          email: vals.email,
          password: vals.password,
        }
      )
      onSubmitProps.resetForm()
      dispatch(
        setLogin({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      )
      handleGoToHome()
    } catch (e: unknown) {
      onSubmitProps.setStatus(getErrorMessage(e, "Invalid credentials"))
    }
  }

  const register = async (vals: RegisterFormValues, onSubmitProps: FormikHelpers<RegisterFormValues>) => {
    try {
      onSubmitProps.setStatus(undefined)
      const { data } = await api.post<{ user: User; accessToken: string; refreshToken: string }>(
        "/auth/register",
        {
          firstName: vals.firstName,
          lastName: vals.lastName,
          email: vals.email,
          password: vals.password,
        }
      )
      onSubmitProps.resetForm()
      dispatch(
        setLogin({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      )
      handleGoToHome()
    } catch (e: unknown) {
      onSubmitProps.setStatus(getErrorMessage(e, "Registration failed"))
    }
  }

  const handleFormSubmit = async (vals: AuthFormValues, onSubmitProps: FormikHelpers<AuthFormValues>) => {
    if (isLogin) {
      await login(vals as LoginFormValues, onSubmitProps as FormikHelpers<LoginFormValues>)
    }
    if (isRegister) {
      await register(vals as RegisterFormValues, onSubmitProps as FormikHelpers<RegisterFormValues>)
    }
  }

  return (
    <Formik<AuthFormValues>
      onSubmit={handleFormSubmit}
      initialValues={initVals}
      validationSchema={validationSchema}
      validateOnBlur
      validateOnChange={false}
    >
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, status, submitCount }) => {
        // AuthFormValues is a union; register-only keys are not on LoginFormValues.
        const touchedFields = touched as Record<string, boolean | undefined>
        const errorFields = errors as Record<string, string | undefined>
        const fieldError = (name: string) => Boolean((touchedFields[name] || submitCount > 0) && errorFields[name])
        const fieldHelper = (name: string) =>
          (touchedFields[name] || submitCount > 0) && errorFields[name] ? String(errorFields[name]) : " "

        const registerValues = values as RegisterFormValues

        return (
          <form onSubmit={handleSubmit} noValidate>
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
                    autoComplete="given-name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={registerValues.firstName}
                    error={fieldError("firstName")}
                    helperText={fieldHelper("firstName")}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <TextField
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={registerValues.lastName}
                    error={fieldError("lastName")}
                    helperText={fieldHelper("lastName")}
                    sx={{ gridColumn: "span 2" }}
                  />
                </>
              )}
              <TextField
                label="Email"
                sx={{ gridColumn: "span 4" }}
                type="email"
                name="email"
                autoComplete="email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                error={fieldError("email")}
                helperText={fieldHelper("email")}
              />
              <TextField
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                error={fieldError("password")}
                helperText={fieldHelper("password")}
                label="Password"
                sx={{ gridColumn: "span 4" }}
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword(v => !v)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {isRegister && (
                <TextField
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={registerValues.cPassword}
                  error={fieldError("cPassword")}
                  helperText={fieldHelper("cPassword")}
                  label="Confirm Password"
                  sx={{ gridColumn: "span 4" }}
                  type={showConfirmPassword ? "text" : "password"}
                  name="cPassword"
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            onClick={() => setShowConfirmPassword(v => !v)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            </Box>
            <Box>
              {status && (
                <Typography sx={{ color: "error.main", mt: "1rem", textAlign: "center" }} role="alert">
                  {String(status)}
                </Typography>
              )}
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
        )
      }}
    </Formik>
  )
}

export default Form
