"use client"

import React, { useState } from "react"
import {
  Close,
  DarkMode,
  Help,
  KeyboardArrowDown,
  LightMode,
  LogoutOutlined,
  Menu,
  PersonAddAlt1,
  PersonOutlined,
} from "@mui/icons-material"
import {
  alpha,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useRouter } from "next/navigation"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { useToast } from "@/providers/ToastProvider"

import { setLogout, toggleMode } from "../state"

import BrandLogo from "./BrandLogo"
import FlexBetween from "./FlexBetween"
import FriendRequestsMenu from "./FriendRequestsMenu"
import NotificationsMenu from "./NotificationsMenu"
import { PAGE_MAX_WIDTH } from "./PageShell"
import UserImage from "./UserImage"

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const user = useAppSelector(state => state.user)
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)")
  const { success } = useToast()

  const theme = useTheme()
  const dark = theme.palette.neutral.dark
  const medium = theme.palette.neutral.medium
  const alt = theme.palette.background.alt
  const isDark = theme.palette.mode === "dark"

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Profile"
  const accountOpen = Boolean(accountAnchor)

  const closeMobile = () => setMobileOpen(false)
  const closeAccount = () => setAccountAnchor(null)

  const handleGoToHome = () => {
    router.push("/home")
  }

  const handleGoToProfile = () => {
    closeAccount()
    closeMobile()
    router.push("/profile")
  }

  const handleLogout = () => {
    closeAccount()
    closeMobile()
    dispatch(setLogout())
    success("Signed out")
    router.push("/login")
  }

  const handleGoToHelp = () => {
    closeAccount()
    closeMobile()
    router.push("/help")
  }

  const handleToggleMode = () => {
    dispatch(toggleMode())
  }

  const themeToggle = (
    <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
      <IconButton
        onClick={handleToggleMode}
        aria-label="Toggle theme"
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          "& .theme-icon": {
            transition: "transform 0.35s ease, opacity 0.2s ease",
          },
          "&:active .theme-icon": {
            transform: "rotate(180deg)",
          },
        }}
      >
        {isDark ? (
          <DarkMode className="theme-icon" sx={{ fontSize: "22px" }} />
        ) : (
          <LightMode className="theme-icon" sx={{ color: dark, fontSize: "22px" }} />
        )}
      </IconButton>
    </Tooltip>
  )

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: theme.zIndex.appBar,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(alt, isDark ? 0.72 : 0.78),
        backdropFilter: "saturate(1.2) blur(14px)",
        WebkitBackdropFilter: "saturate(1.2) blur(14px)",
      }}
    >
      <FlexBetween
        sx={{
          width: "100%",
          maxWidth: PAGE_MAX_WIDTH,
          margin: "0 auto",
          padding: { xs: "0.65rem 0.85rem", sm: "0.75rem 1.25rem", md: "0.8rem 1.75rem" },
        }}
      >
        <BrandLogo size="nav" onClick={handleGoToHome} />

        {isNonMobileScreens ? (
          <FlexBetween sx={{ gap: "0.5rem" }}>
            {themeToggle}
            <FriendRequestsMenu />
            <NotificationsMenu />
            <Tooltip title="Help & FAQ">
              <IconButton onClick={handleGoToHelp} aria-label="Help">
                <Help sx={{ fontSize: "25px" }} />
              </IconButton>
            </Tooltip>
            <Button
              onClick={e => setAccountAnchor(e.currentTarget)}
              aria-haspopup="true"
              aria-expanded={accountOpen}
              aria-controls={accountOpen ? "account-menu" : undefined}
              endIcon={
                <KeyboardArrowDown
                  sx={{
                    fontSize: "1.15rem",
                    transition: "transform 0.15s ease",
                    transform: accountOpen ? "rotate(180deg)" : "none",
                  }}
                />
              }
              sx={{
                color: dark,
                textTransform: "none",
                fontWeight: 500,
                px: 1,
                minWidth: 0,
                gap: 0.75,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: theme.palette.divider,
                },
              }}
            >
              <UserImage
                image={user?.picturePath || ""}
                name={fullName}
                size="28px"
                bgColor={user?.avatarColor}
              />
              <Typography
                component="span"
                noWrap
                sx={{
                  maxWidth: 120,
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: dark,
                }}
              >
                {user?.firstName || "Account"}
              </Typography>
            </Button>
            <MuiMenu
              id="account-menu"
              anchorEl={accountAnchor}
              open={accountOpen}
              onClose={closeAccount}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{
                paper: { sx: { mt: 1, minWidth: 200 } },
              }}
            >
              <MenuItem onClick={handleGoToProfile}>
                <ListItemIcon>
                  <PersonOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleGoToHelp}>
                <ListItemIcon>
                  <Help fontSize="small" />
                </ListItemIcon>
                <ListItemText>Help & FAQ</ListItemText>
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText slotProps={{ primary: { sx: { color: "error.main" } } }}>
                  Log out
                </ListItemText>
              </MenuItem>
            </MuiMenu>
          </FlexBetween>
        ) : (
          <FlexBetween sx={{ gap: 0.5 }}>
            <FriendRequestsMenu />
            <NotificationsMenu />
            <IconButton
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      <Drawer
        id="mobile-nav-drawer"
        anchor="right"
        open={!isNonMobileScreens && mobileOpen}
        onClose={closeMobile}
        slotProps={{
          paper: {
            sx: {
              width: "min(320px, 88vw)",
              bgcolor: alt,
              borderLeft: `1px solid ${theme.palette.divider}`,
              backgroundImage: "none",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <FlexBetween sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: dark }}>
              Menu
            </Typography>
            <IconButton onClick={closeMobile} aria-label="Close menu">
              <Close />
            </IconButton>
          </FlexBetween>
          <Divider />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 2,
            }}
          >
            <UserImage
              image={user?.picturePath || ""}
              name={fullName}
              size="48px"
              bgColor={user?.avatarColor}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 600, color: dark }}>
                {fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: medium }}>
                Your account
              </Typography>
            </Box>
          </Box>
          <Divider />

          <List sx={{ px: 1, py: 1, flex: 1 }}>
            <ListItemButton onClick={handleGoToProfile} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonOutlined />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
            <ListItemButton
              onClick={() => {
                closeMobile()
                router.push("/friend-requests")
              }}
              sx={{ borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <PersonAddAlt1 />
              </ListItemIcon>
              <ListItemText primary="Friend requests" />
            </ListItemButton>
            <ListItemButton onClick={handleGoToHelp} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Help />
              </ListItemIcon>
              <ListItemText primary="Help & FAQ" />
            </ListItemButton>
            <ListItemButton onClick={handleToggleMode} sx={{ borderRadius: 2 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                {isDark ? <LightMode /> : <DarkMode />}
              </ListItemIcon>
              <ListItemText primary={isDark ? "Light mode" : "Dark mode"} />
            </ListItemButton>
          </List>

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              onClick={handleLogout}
              startIcon={<LogoutOutlined />}
              sx={{
                color: theme.palette.error.main,
                textTransform: "none",
                justifyContent: "flex-start",
                px: 1.5,
              }}
            >
              Log out
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default Navbar
