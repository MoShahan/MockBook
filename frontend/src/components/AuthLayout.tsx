"use client"

import { type ReactNode } from "react"
import { DarkMode, LightMode } from "@mui/icons-material"
import { alpha, Box, IconButton, keyframes, Typography, useMediaQuery, useTheme } from "@mui/material"

import { useAppDispatch } from "@/app/hooks"
import BrandLogo from "@/components/BrandLogo"
import SiteFooter from "@/components/SiteFooter"
import { toggleMode } from "@/state"

type AuthLayoutProps = {
  headline: string
  supporting: string
  children: ReactNode
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

/**
 * Auth shell: wave pattern full-bleed background; café/social art flush on the left; form on the right.
 */
const AuthLayout = ({ headline, supporting, children }: AuthLayoutProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const isWide = useMediaQuery("(min-width:900px)")
  const isDark = theme.palette.mode === "dark"
  const waveSrc = isDark ? "/auth-wave-dark.jpg" : "/auth-wave-light.jpg"
  const panelSrc = isDark ? "/auth-panel-dark.jpg" : "/auth-panel-light.jpg"

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "auto", md: "100dvh" },
        minHeight: "100dvh",
        overflow: { xs: "auto", md: "hidden" },
      }}
    >
      <IconButton
        onClick={() => dispatch(toggleMode())}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        sx={{
          position: "absolute",
          top: { xs: 12, md: 16 },
          right: { xs: 12, md: 16 },
          zIndex: 2,
          bgcolor: isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.white, 0.72),
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(8px)",
          color: isDark ? theme.palette.common.white : theme.palette.neutral.dark,
          "&:hover": {
            bgcolor: isDark ? alpha(theme.palette.common.white, 0.14) : alpha(theme.palette.common.white, 0.9),
          },
        }}
      >
        {isDark ? <LightMode /> : <DarkMode />}
      </IconButton>

      {/* Full-page wave atmosphere */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${waveSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.45)} 0%, ${alpha(theme.palette.background.default, 0.3)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.4)} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: { xs: "auto", md: "100%" },
          minHeight: { xs: "100dvh", md: "100%" },
          display: "flex",
          flexDirection: isWide ? "row" : "column",
          boxSizing: "border-box",
        }}
      >
        {/* Left: café image - flush to left / top / bottom (no gap) */}
        <Box
          component="aside"
          sx={{
            position: "relative",
            flex: isWide ? "1 1 46%" : "0 0 auto",
            alignSelf: "stretch",
            minHeight: isWide ? 0 : 220,
            height: isWide ? "100%" : undefined,
            overflow: "hidden",
            animation: `${fadeIn} 0.7s ease-out`,
          }}
        >
          <Box
            component="img"
            src={panelSrc}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? `linear-gradient(160deg, ${alpha(theme.palette.common.black, 0.5)} 10%, ${alpha(theme.palette.common.black, 0.68)} 100%)`
                : `linear-gradient(160deg, ${alpha(theme.palette.common.black, 0.3)} 0%, ${alpha(theme.palette.common.black, 0.48)} 100%)`,
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              minHeight: isWide ? "100%" : 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: isWide ? "space-between" : "flex-end",
              p: { xs: 2.5, md: 4 },
              color: theme.palette.common.white,
              boxSizing: "border-box",
            }}
          >
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <BrandLogo size="auth" />
            </Box>
            <Box sx={{ maxWidth: 420, pb: { xs: 0.5, md: 2 } }}>
              <Typography
                variant="h2"
                sx={{
                  color: "common.white",
                  textShadow: theme => `0 2px 18px ${alpha(theme.palette.common.black, 0.35)}`,
                  mb: 1,
                  fontSize: { xs: "1.5rem", md: "1.95rem" },
                }}
              >
                {headline}
              </Typography>
              <Typography
                sx={{
                  color: theme => alpha(theme.palette.common.white, 0.88),
                  textShadow: theme => `0 1px 10px ${alpha(theme.palette.common.black, 0.3)}`,
                  fontSize: { xs: "0.875rem", md: "0.95rem" },
                  lineHeight: 1.5,
                }}
              >
                {supporting}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: form over wave */}
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: isWide ? "1 1 54%" : "1 1 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 2, sm: 4 },
            py: { xs: 3, md: 2 },
            bgcolor: "transparent",
            minHeight: 0,
            overflow: isWide ? "auto" : "visible",
            outline: "none",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 440,
              animation: `${fadeUp} 0.55s ease-out`,
            }}
          >
            <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", mb: 3 }}>
              <BrandLogo size="auth" />
            </Box>
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 3,
                bgcolor: isDark
                  ? alpha(theme.palette.background.alt, 0.9)
                  : alpha(theme.palette.common.white, 0.94),
                backdropFilter: "blur(12px)",
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: isDark
                  ? `0 12px 40px ${alpha(theme.palette.common.black, 0.35)}`
                  : `0 12px 36px ${alpha(theme.palette.common.black, 0.08)}`,
              }}
            >
              {children}
            </Box>
            <SiteFooter compact />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default AuthLayout
