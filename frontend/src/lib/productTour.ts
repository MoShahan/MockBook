/** Stable selectors for the product tour (use `data-tour` on targets). */
export const TOUR_SELECTORS = {
  compose: '[data-tour="compose"]',
  addPeople: '[data-tour="add-people"]',
  findPeopleNav: '[data-tour="nav-find-people"]',
  notifications: '[data-tour="notifications"]',
  navProfile: '[data-tour="nav-profile"]',
} as const

/** localStorage key — first auto-run only once per browser. */
export const TOUR_SEEN_KEY = "xivi.tour.v1.seen"

/** Ask AppShell to open the mobile drawer (profile step on small screens). */
export const TOUR_OPEN_MENU_EVENT = "xivi:tour-open-menu"

/** Ask AppShell to open the mobile drawer so Find people is visible. */
export const TOUR_OPEN_FIND_PEOPLE_NAV_EVENT = "xivi:tour-open-find-people-nav"

export function hasSeenProductTour(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1"
  } catch {
    return true
  }
}

export function markProductTourSeen(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1")
  } catch {
    // ignore quota / private mode
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    window.setTimeout(resolve, ms)
  })
}
