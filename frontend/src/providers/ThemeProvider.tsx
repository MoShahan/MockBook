"use client"

import React, { type ReactNode, useMemo } from "react"
import { createTheme, ThemeProvider } from "@mui/material"

import { useAppSelector } from "@/app/hooks"
import { themeSettings } from "@/theme"

const ThemeProviderComp = ({ children }: { children: ReactNode }) => {
  const mode = useAppSelector(state => state.mode)
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default ThemeProviderComp
