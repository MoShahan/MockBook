"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import { Alert, Snackbar } from "@mui/material"

export type ToastSeverity = "success" | "error" | "warning" | "info"

type ToastApi = {
  showToast: (message: string, severity?: ToastSeverity) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return ctx
}

const AUTO_HIDE_MS = 3500

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState<ToastSeverity>("info")

  const showToast = useCallback((msg: string, sev: ToastSeverity = "info") => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
  }, [])

  const api = useMemo<ToastApi>(
    () => ({
      showToast,
      success: msg => showToast(msg, "success"),
      error: msg => showToast(msg, "error"),
      info: msg => showToast(msg, "info"),
      warning: msg => showToast(msg, "warning"),
    }),
    [showToast]
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={(_, reason) => {
          if (reason === "clickaway") return
          setOpen(false)
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={severity}
          variant="filled"
          onClose={() => setOpen(false)}
          sx={{ width: "100%" }}
          role={severity === "error" ? "alert" : "status"}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export default ToastProvider
