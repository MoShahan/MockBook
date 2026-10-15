import { CssBaseline } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import AuthProvider from "@/providers/AuthProvider"
import ReduxProvider from "@/providers/ReduxProvider"
import ThemeProviderComp from "@/providers/ThemeProvider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MockBook",
  description: "by Mohammed Shahan",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ReduxProvider>
            <AuthProvider>
              <ThemeProviderComp>
                <CssBaseline />
                {children}
              </ThemeProviderComp>
            </AuthProvider>
          </ReduxProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
