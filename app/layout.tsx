import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AnalyticsProvider } from "@/components/analytics-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "SuperNate - Resume Game Mission",
  description: "Help SuperNate defeat the PDfff aliens and recover work experience memories!",
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
