"use client"

import React, { useState } from "react"
import { Close, DarkMode, Help, LightMode, LogoutOutlined, Menu } from "@mui/icons-material"
import { alpha, Box, Button, IconButton, Tooltip, useMediaQuery, useTheme } from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useToast } from "@/providers/ToastProvider"

import { setLogout, toggleMode } from "../state"

import BrandLogo from "./BrandLogo"
import FlexBetween from "./FlexBetween"
import NotificationsMenu from "./NotificationsMenu"
import { PAGE_MAX_WIDTH } from "./PageShell"

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const { success } = useToast()

  const theme = useTheme()
  const nLight = theme.palette.neutral.light
  const dark = theme.palette.neutral.dark
  const alt = theme.palette.background.alt

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Profile"

  const handleGoToHome = () => {
    router.push("/home")
  }

  const handleGoToProfile = () => {
    setIsMobileMenuToggled(false)
    router.push("/profile")
  }

  const handleLogout = () => {
    setIsMobileMenuToggled(false)
    dispatch(setLogout())
    success("Signed out")
    router.push("/login")
  }

  const handleGoToHelp = () => {
    setIsMobileMenuToggled(false)
    router.push("/help")
  }

  const accountActions = (
    <>
      <Button onClick={handleGoToProfile} sx={{ color: dark, textTransform: "none", fontWeight: 500 }}>
        {fullName}
      </Button>
      <Button
        onClick={handleLogout}
        startIcon={<LogoutOutlined />}
        sx={{ color: dark, textTransform: "none" }}
      >
        Log Out
      </Button>
    </>
  )

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: theme.zIndex.appBar,
        borderBottom: `1px solid ${theme.palette.divider}`,
        // Glassy navbar only — page cards stay solid (Step 5.1 / 3C).
        bgcolor: alpha(alt, theme.palette.mode === "dark" ? 0.72 : 0.78),
        backdropFilter: "saturate(1.2) blur(14px)",
        WebkitBackdropFilter: "saturate(1.2) blur(14px)",
      }}
    >
      <FlexBetween
        sx={{
          width: "100%",
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: { xs: "0.85rem 1rem", sm: "1rem 1.5rem", md: "1rem 2rem" },
        }}
      >
        <BrandLogo size="nav" onClick={handleGoToHome} />

        {isNonMobileScreens ? (
          <FlexBetween sx={{ gap: "0.75rem" }}>
            <Tooltip title={theme.palette.mode === "dark" ? "Light mode" : "Dark mode"}>
              <IconButton
                onClick={() => dispatch(toggleMode())}
                aria-label="Toggle theme"
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                }}
              >
                {theme.palette.mode === "dark" ? (
                  <DarkMode sx={{ fontSize: "22px" }} />
                ) : (
                  <LightMode sx={{ color: dark, fontSize: "22px" }} />
                )}
              </IconButton>
            </Tooltip>
            <NotificationsMenu />
            <Tooltip title="Help & FAQ">
              <IconButton onClick={handleGoToHelp} aria-label="Help">
                <Help sx={{ fontSize: "25px" }} />
              </IconButton>
            </Tooltip>
            {accountActions}
          </FlexBetween>
        ) : (
          <IconButton onClick={() => setIsMobileMenuToggled(prev => !prev)} aria-label="Open menu">
            <Menu />
          </IconButton>
        )}
      </FlexBetween>

      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          sx={{
            position: "fixed",
            right: "0",
            bottom: "0",
            height: "100%",
            zIndex: "10",
            maxWidth: "500px",
            minWidth: "300px",
            bgcolor: nLight,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: "1rem" }}>
            <IconButton onClick={() => setIsMobileMenuToggled(prev => !prev)} aria-label="Close menu">
              <Close />
            </IconButton>
          </Box>

          <FlexBetween sx={{ gap: "2rem", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <IconButton onClick={() => dispatch(toggleMode())} aria-label="Toggle theme">
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <NotificationsMenu />
            <IconButton onClick={handleGoToHelp} aria-label="Help">
              <Help sx={{ fontSize: "25px" }} />
            </IconButton>
            {accountActions}
          </FlexBetween>
        </Box>
      )}
    </Box>
  )
}

export default Navbar
