"use client"

import React, { useMemo } from "react"
import { createTheme, ThemeProvider } from "@mui/material"
import { useSelector } from "react-redux"

import { themeSettings } from "@/theme"

const ThemeProviderComp = ({ children }: any) => {
  const mode = useSelector((state: any) => state?.mode)
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default ThemeProviderComp
