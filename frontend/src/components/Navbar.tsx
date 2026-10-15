"use client"

import React, { useState } from "react"
import { Close, DarkMode, Help, LightMode, Menu, Notifications, Search } from "@mui/icons-material"
import {
  Box,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useToast } from "@/providers/ToastProvider"

import { setLogout, toggleMode } from "../state"

import FlexBetween from "./FlexBetween"

const COMING_SOON = "This feature is coming soon"

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const { info } = useToast()

  const theme = useTheme()
  const nLight = theme.palette.neutral.light
  const dark = theme.palette.neutral.dark
  const bg = theme.palette.background.default
  const pLight = theme.palette.primary.light
  const alt = theme.palette.background.alt

  const fullName = `${user?.firstName || "John"} ${user?.lastName || "Doe"}`

  const handleGoToHome = () => {
    router.push("/home")
  }

  const handleLogout = () => {
    dispatch(setLogout())
    router.push("/login")
  }

  const showComingSoon = () => {
    info(COMING_SOON)
  }

  return (
    <FlexBetween sx={{ padding: "1rem 6%", bgcolor: alt }}>
      <FlexBetween sx={{ gap: "1.75rem" }}>
        <Typography
          onClick={() => handleGoToHome()}
          sx={{
            fontWeight: "bold",
            fontSize: "clamp(1rem,2rem,2.25rem)",
            color: "primary",
            "&:hover": { color: pLight, cursor: "pointer" },
          }}
        >
          MERN - Social Media
        </Typography>
        {isNonMobileScreens && (
          <FlexBetween sx={{ bgcolor: nLight, borderRadius: "8px", gap: "3rem", padding: "0.1rem 1.5rem" }}>
            <InputBase placeholder="Search..." />
            <IconButton onClick={showComingSoon} aria-label="Search">
              <Search />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {isNonMobileScreens ? (
        <FlexBetween sx={{ gap: "2rem" }}>
          <IconButton onClick={() => dispatch(toggleMode())} aria-label="Toggle theme">
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton onClick={showComingSoon} aria-label="Notifications">
            <Notifications sx={{ fontSize: "25px" }} />
          </IconButton>
          <IconButton onClick={showComingSoon} aria-label="Help">
            <Help sx={{ fontSize: "25px" }} />
          </IconButton>
          <FormControl variant="standard" defaultValue={fullName}>
            <Select
              defaultValue={fullName}
              value={fullName}
              sx={{
                bgcolor: nLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3 rem",
                },
                "& .MuiSelect-select:focus": { bgcolor: nLight },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton onClick={() => setIsMobileMenuToggled(prev => !prev)} aria-label="Open menu">
          <Menu />
        </IconButton>
      )}

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

          <FlexBetween sx={{ gap: "3rem", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <IconButton onClick={() => dispatch(toggleMode())} aria-label="Toggle theme">
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <IconButton onClick={showComingSoon} aria-label="Notifications">
              <Notifications sx={{ fontSize: "25px" }} />
            </IconButton>
            <IconButton onClick={showComingSoon} aria-label="Help">
              <Help sx={{ fontSize: "25px" }} />
            </IconButton>
            <FormControl variant="standard" defaultValue={fullName}>
              <Select
                defaultValue={fullName}
                value={fullName}
                sx={{
                  bgcolor: bg,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3 rem",
                  },
                  "& .MuiSelect-select:focus": {
                    bgcolor: bg,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Log Out</MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  )
}

export default Navbar
