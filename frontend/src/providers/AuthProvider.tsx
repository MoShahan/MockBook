"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"

const PUBLIC_PATHS = new Set(["/login", "/register"])

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const isAuth = Boolean(useAppSelector(state => state.accessToken))
  const isPublic = PUBLIC_PATHS.has(pathname)

  useEffect(() => {
    if (!isAuth && !isPublic) {
      router.replace("/login")
    }
  }, [isAuth, isPublic, router])

  return <>{children}</>
}

export default AuthProvider
