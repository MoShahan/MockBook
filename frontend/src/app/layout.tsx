import { CssBaseline } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import type { Metadata } from "next"
import { Fraunces, Source_Sans_3 } from "next/font/google"

import AuthProvider from "@/providers/AuthProvider"
import ReduxProvider from "@/providers/ReduxProvider"
import ThemeProviderComp from "@/providers/ThemeProvider"
import ToastProvider from "@/providers/ToastProvider"

import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "MockBook",
    template: "%s · MockBook",
  },
  description: "MockBook - connect with friends, share posts, and stay in the loop.",
  applicationName: "MockBook",
  appleWebApp: {
    title: "MockBook",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable}`}>
      <body className={sourceSans.className}>
        <AppRouterCacheProvider>
          <ReduxProvider>
            <AuthProvider>
              <ThemeProviderComp>
                <ToastProvider>
                  <CssBaseline />
                  {children}
                </ToastProvider>
              </ThemeProviderComp>
            </AuthProvider>
          </ReduxProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
