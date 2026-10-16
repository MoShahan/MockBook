"use client"

import { type ReactNode } from "react"
import { usePathname } from "next/navigation"

import AuthLayout from "@/components/AuthLayout"

/**
 * Shared auth chrome for /login and /register.
 * Next.js keeps this layout mounted across soft navigations, so the wave/forest
 * panel does not remount when switching forms.
 */
export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isRegister = pathname?.startsWith("/register")

  return (
    <AuthLayout
      headline={isRegister ? "Join MockBook" : "Stay close to your people"}
      supporting={
        isRegister
          ? "Create an account and start sharing with friends in minutes."
          : "Share moments, follow friends, and pick up conversations — all in one calm place."
      }
    >
      {children}
    </AuthLayout>
  )
}
