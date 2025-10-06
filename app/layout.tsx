import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PostHogProvider } from "@/components/posthog-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "SpaceHog Spiff - NateHog Resume Mission",
  description: "Help SpaceHog Spiff rescue NateHog memories from the PDfff aliens!",
  generator: "v0.app",
  icons: {
    icon: "/spacehog.png",
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
        <PostHogProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </PostHogProvider>
        <Analytics />
      </body>
    </html>
  )
}
