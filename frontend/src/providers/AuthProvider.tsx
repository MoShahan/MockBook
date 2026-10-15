"use client"

import React from "react"
import { useRouter } from "next/navigation"

import { useAppSelector } from "@/app/hooks"

const AuthProvider = ({ children }: any) => {
  const router = useRouter()

  const isAuth = Boolean(useAppSelector(state => state.accessToken))

  if (!isAuth) {
    router.push("/login")
  }

  return <>{children}</>
}

export default AuthProvider
