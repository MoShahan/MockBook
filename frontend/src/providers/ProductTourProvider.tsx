"use client"

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react"
import { useTheme } from "@mui/material"
import { usePathname, useRouter } from "next/navigation"
import { EVENTS, STATUS, type Step, useJoyride } from "react-joyride"

import { useAppSelector } from "@/app/hooks"
import {
  delay,
  hasSeenProductTour,
  markProductTourSeen,
  TOUR_OPEN_FIND_PEOPLE_NAV_EVENT,
  TOUR_OPEN_MENU_EVENT,
  TOUR_SELECTORS,
} from "@/lib/productTour"

type ProductTourContextValue = {
  startTour: () => void
}

const ProductTourContext = createContext<ProductTourContextValue | null>(null)

export function useProductTour(): ProductTourContextValue {
  const ctx = useContext(ProductTourContext)
  if (!ctx) {
    throw new Error("useProductTour must be used within ProductTourProvider")
  }
  return ctx
}

/** Slim AppShell top bar - keep page targets below it so the spotlight doesn’t include the header. */
const STICKY_HEADER_OFFSET_PX = 64

async function scrollTourTargetIntoView(selector: string, block: ScrollLogicalPosition = "center") {
  const el = document.querySelector(selector)
  if (!(el instanceof HTMLElement)) return
  el.scrollIntoView({ block, inline: "nearest", behavior: "auto" })
  await delay(120)
}

function buildTourSteps(): Step[] {
  return [
    {
      id: "compose",
      target: TOUR_SELECTORS.compose,
      title: "Create a post",
      content: "Type a message here, optionally add a photo or emoji, then send. Your post appears in the feed below.",
      placement: "bottom",
      targetWaitTimeout: 4000,
      before: async () => {
        await scrollTourTargetIntoView(TOUR_SELECTORS.compose, "center")
      },
    },
    {
      id: "add-people",
      target: TOUR_SELECTORS.findPeopleNav,
      title: "Find people",
      content:
        "Open Find people to search and connect. Send a friend request for mutual friends, or follow someone to see their posts in Following.",
      placement: "right",
      targetWaitTimeout: 4000,
      skipScroll: true,
      before: async () => {
        window.dispatchEvent(new Event(TOUR_OPEN_FIND_PEOPLE_NAV_EVENT))
        await delay(400)
      },
    },
    {
      id: "notifications",
      target: TOUR_SELECTORS.notifications,
      title: "Notifications",
      content:
        "Open the bell to see likes, comments, and other updates. Unread items show a badge here.",
      placement: "bottom",
      targetWaitTimeout: 4000,
      // Already in the slim top bar - don’t scroll the page.
      skipScroll: true,
    },
    {
      id: "nav-profile",
      target: TOUR_SELECTORS.navProfile,
      title: "Your profile",
      content: "Click your name at the bottom of the sidebar to open your profile - edit details, change your photo, and see your posts, friends, and saved items.",
      placement: "right",
      targetWaitTimeout: 4000,
      skipScroll: true,
      before: async () => {
        window.dispatchEvent(new Event(TOUR_OPEN_MENU_EVENT))
        await delay(350)
      },
    },
  ]
}

const AUTH_SHELL_PREFIXES = [
  "/home",
  "/profile",
  "/post/",
  "/notifications",
  "/friend-requests",
  "/people",
  "/settings",
  "/help",
]

function isAuthShellPath(pathname: string): boolean {
  return AUTH_SHELL_PREFIXES.some(p => pathname === p || pathname.startsWith(p))
}

const ProductTourProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const user = useAppSelector(s => s.user)
  const accessToken = useAppSelector(s => s.accessToken)
  const pendingStart = useRef(false)
  const autoStarted = useRef(false)

  const steps = useMemo(() => buildTourSteps(), [])

  const isDark = theme.palette.mode === "dark"
  const primary = theme.palette.primary.main
  const bg = theme.palette.background.paper
  const text = theme.palette.text.primary

  const { controls, Tour } = useJoyride({
    steps,
    continuous: true,
    scrollToFirstStep: true,
    options: {
      skipBeacon: true,
      showProgress: true,
      primaryColor: primary,
      backgroundColor: bg,
      textColor: text,
      arrowColor: bg,
      overlayColor: isDark ? "rgba(0,0,0,0.65)" : "rgba(28,25,23,0.45)",
      zIndex: theme.zIndex.modal + 2,
      spotlightRadius: 10,
      // Keep cutout clear of the slim AppShell top bar.
      scrollOffset: STICKY_HEADER_OFFSET_PX,
      spotlightPadding: { top: 6, right: 8, bottom: 8, left: 8 },
      buttons: ["back", "close", "primary", "skip"],
      closeButtonAction: "skip",
      overlayClickAction: "close",
      targetWaitTimeout: 2500,
    },
    locale: {
      back: "Back",
      close: "Close",
      last: "Done",
      next: "Next",
      nextWithProgress: "Next ({current}/{total})",
      skip: "Skip",
    },
    onEvent: (data, ctrl) => {
      if (data.type === EVENTS.TARGET_NOT_FOUND) {
        // Soft-skip missing targets (e.g. compose off-page) instead of stalling.
        if (data.index < data.size - 1) {
          ctrl.next()
        } else {
          ctrl.skip()
        }
        return
      }
      if (data.type === EVENTS.TOUR_END || data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        markProductTourSeen()
      }
    },
  })

  const beginTour = useCallback(() => {
    // Wait for menus/drawers to close and /home targets to mount before measuring.
    window.setTimeout(() => {
      void (async () => {
        await scrollTourTargetIntoView(TOUR_SELECTORS.compose, "center")
        controls.reset(true)
      })()
    }, 120)
  }, [controls])

  const startTour = useCallback(() => {
    if (!accessToken || !user) return

    if (pathname !== "/home") {
      pendingStart.current = true
      router.push("/home")
      return
    }

    beginTour()
  }, [accessToken, user, pathname, router, beginTour])

  // Resume tour after navigating to /home.
  useEffect(() => {
    if (!pendingStart.current || pathname !== "/home") return
    pendingStart.current = false
    const t = window.setTimeout(() => beginTour(), 200)
    return () => window.clearTimeout(t)
  }, [pathname, beginTour])

  // Optional: auto-run once on first authenticated home visit.
  useEffect(() => {
    if (autoStarted.current) return
    if (!accessToken || !user) return
    if (pathname !== "/home") return
    if (hasSeenProductTour()) return
    autoStarted.current = true
    const t = window.setTimeout(() => beginTour(), 600)
    return () => window.clearTimeout(t)
  }, [accessToken, user, pathname, beginTour])

  const value = useMemo(() => ({ startTour }), [startTour])

  const showTourUi = Boolean(accessToken && user && isAuthShellPath(pathname))

  return (
    <ProductTourContext.Provider value={value}>
      {children}
      {showTourUi ? Tour : null}
    </ProductTourContext.Provider>
  )
}

export default ProductTourProvider
