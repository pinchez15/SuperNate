import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "SuperNate 64 — Hop on a Quick Call",
  description:
    "Walk the town, meet the people behind Nate's products, then get HedgeHawkins to hop on a quick call.",
  generator: "v0.app",
  icons: {
    icon: "/SuperNate.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AnalyticsProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </AnalyticsProvider>
        <Analytics />
      </body>
    </html>
  )
}
