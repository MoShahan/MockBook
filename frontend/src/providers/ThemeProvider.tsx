"use client"

import React, { type ReactNode, useEffect, useMemo, useRef } from "react"
import { createTheme, ThemeProvider } from "@mui/material"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { setMode } from "@/state"
import { themeSettings } from "@/theme"

const PERSIST_KEY = "persist:root"

/**
 * On a true first visit (no redux-persist blob yet), follow `prefers-color-scheme`.
 * After the user toggles theme, persist keeps their choice.
 */
function useSystemThemeOnFirstVisit() {
  const dispatch = useAppDispatch()
  const applied = useRef(false)

  useEffect(() => {
    if (applied.current) return
    applied.current = true
    try {
      if (typeof window === "undefined") return
      if (window.localStorage.getItem(PERSIST_KEY)) return
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      dispatch(setMode(prefersDark ? "dark" : "light"))
    } catch {
      // ignore storage / matchMedia failures
    }
  }, [dispatch])
}

const ThemeProviderComp = ({ children }: { children: ReactNode }) => {
  const mode = useAppSelector(state => state.mode)
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode])
  useSystemThemeOnFirstVisit()

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}

export default ThemeProviderComp
