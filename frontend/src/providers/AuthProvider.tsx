"use client"

import React, { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { api } from "@/lib/api"
import { setLogout, setUser } from "@/state"
import type { User } from "@/types/models"

/** Routes that unauthenticated users may open. */
const PUBLIC_PATHS = new Set(["/login", "/register", "/auth/callback"])

/** Finish OAuth handoff here — do not bounce away while tokens are being exchanged for a user. */
const OAUTH_CALLBACK_PATH = "/auth/callback"

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const accessToken = useAppSelector(state => state.accessToken)
  const user = useAppSelector(state => state.user)
  const isAuth = Boolean(accessToken)
  const isPublic = PUBLIC_PATHS.has(pathname)
  const hydrating = useRef(false)

  // Token without user (e.g. OAuth interrupted by a premature redirect): load /auth/me.
  useEffect(() => {
    if (!accessToken || user || hydrating.current) return
    if (pathname === OAUTH_CALLBACK_PATH) return // callback page owns this fetch
    hydrating.current = true
    void (async () => {
      try {
        const { data } = await api.get<{ user: User }>("/auth/me")
        dispatch(setUser({ user: data.user }))
      } catch {
        dispatch(setLogout())
      } finally {
        hydrating.current = false
      }
    })()
  }, [accessToken, user, pathname, dispatch])

  useEffect(() => {
    // Not logged in on a protected route: send to login
    if (!isAuth && !isPublic) {
      router.replace("/login")
      return
    }
    // Already logged in: leave login/register, but never yank /auth/callback mid-handoff
    if (isAuth && isPublic && pathname !== OAUTH_CALLBACK_PATH) {
      router.replace("/home")
    }
  }, [isAuth, isPublic, pathname, router])

  return <>{children}</>
}

export default AuthProvider
