"use client"

import React, { useState } from "react"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Formik, type FormikHelpers } from "formik"
import { useRouter } from "next/navigation"
import type { ObjectSchema } from "yup"

import { useAppDispatch } from "@/app/hooks"
import OauthButtons from "@/components/OauthButtons"
import { api } from "@/lib/api"
import { getErrorMessage } from "@/lib/errors"
import { useToast } from "@/providers/ToastProvider"
import { setLogin } from "@/state"
import type { LoginFormValues, RegisterFormValues, User } from "@/types/models"

type AuthFormValues = LoginFormValues | RegisterFormValues

type FormProps =
  | {
      type: "login"
      validationSchema: ObjectSchema<LoginFormValues>
      initVals: LoginFormValues
      oauthError?: string | null
    }
  | {
      type: "register"
      validationSchema: ObjectSchema<RegisterFormValues>
      initVals: RegisterFormValues
      oauthError?: string | null
    }

const Form = ({ type, validationSchema, initVals, oauthError = null }: FormProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { success, error: toastError } = useToast()
  const isNonMobile = useMediaQuery("(min-width:600px)")
  const isLogin = type === "login"
  const isRegister = type === "register"

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      router.push("/home")
    } catch (e: unknown) {
      const msg = getErrorMessage(e, "Invalid credentials")
      onSubmitProps.setStatus(msg)
      toastError(msg)
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
      success("Welcome to MockBook!")
      router.push("/home")
    } catch (e: unknown) {
      const msg = getErrorMessage(e, "Registration failed")
      onSubmitProps.setStatus(msg)
      toastError(msg)
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
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        status,
        submitCount,
        isSubmitting,
      }) => {
        const touchedFields = touched as Record<string, boolean | undefined>
        const errorFields = errors as Record<string, string | undefined>
        const fieldError = (name: string) =>
          Boolean((touchedFields[name] || submitCount > 0) && errorFields[name])
        const fieldHelper = (name: string) =>
          (touchedFields[name] || submitCount > 0) && errorFields[name]
            ? String(errorFields[name])
            : " "

        const registerValues = values as RegisterFormValues

        return (
          <form onSubmit={handleSubmit} noValidate>
            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 4",
                },
              }}
            >
              {isRegister && (
                <>
                  <TextField
                    label="First name"
                    name="firstName"
                    autoComplete="given-name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={registerValues.firstName}
                    error={fieldError("firstName")}
                    helperText={fieldHelper("firstName")}
                    sx={{ gridColumn: "span 2" }}
                    fullWidth
                  />
                  <TextField
                    label="Last name"
                    name="lastName"
                    autoComplete="family-name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={registerValues.lastName}
                    error={fieldError("lastName")}
                    helperText={fieldHelper("lastName")}
                    sx={{ gridColumn: "span 2" }}
                    fullWidth
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
                fullWidth
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
                fullWidth
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
                  label="Confirm password"
                  sx={{ gridColumn: "span 4" }}
                  type={showConfirmPassword ? "text" : "password"}
                  name="cPassword"
                  autoComplete="new-password"
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                            }
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

            {status ? (
              <Typography sx={{ color: "error.main", mt: 1.5 }} role="alert">
                {String(status)}
              </Typography>
            ) : null}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{
                mt: 2.5,
                mb: 2,
                py: 1.35,
                fontSize: "1rem",
                transition: "transform 0.15s ease, background-color 0.15s ease",
                "&:active:not(:disabled)": { transform: "scale(0.985)" },
              }}
            >
              {isSubmitting ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Sign in" : "Create account"}
            </Button>

            <Typography sx={{ textAlign: "center", color: "text.secondary", fontSize: "0.95rem" }}>
              {isLogin ? (
                <>
                  New to MockBook?{" "}
                  <MuiLink
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => router.replace("/register")}
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      verticalAlign: "baseline",
                      cursor: "pointer",
                      border: 0,
                      background: "none",
                      font: "inherit",
                    }}
                  >
                    Create an account
                  </MuiLink>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <MuiLink
                    component="button"
                    type="button"
                    underline="hover"
                    onClick={() => router.replace("/login")}
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      verticalAlign: "baseline",
                      cursor: "pointer",
                      border: 0,
                      background: "none",
                      font: "inherit",
                    }}
                  >
                    Sign in
                  </MuiLink>
                </>
              )}
            </Typography>

            <OauthButtons oauthError={oauthError} />
          </form>
        )
      }}
    </Formik>
  )
}

export default Form
