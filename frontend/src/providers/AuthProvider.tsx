"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"

const PUBLIC_PATHS = new Set(["/login", "/register", "/auth/callback"])

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const isAuth = Boolean(useAppSelector(state => state.accessToken))
  const isPublic = PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    // Not logged in on a protected route: send to login
    if (!isAuth && !isPublic) {
      router.replace("/login")
      return
    }
    // Already logged in: don't stay on login/register
    if (isAuth && isPublic) {
      router.replace("/home")
    }
  }, [isAuth, isPublic, router])

  return <>{children}</>
}

export default AuthProvider
