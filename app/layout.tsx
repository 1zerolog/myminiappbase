import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Snake Game - Fast and Classic Snake",
  description: "Smooth, touch-enabled classic snake game in your browser.",
  generator: "v0.app",
  manifest: "/manifest.json",
  openGraph: {
    title: "Snake Game",
    description: "A fast mini game discoverable on Base.",
    images: [
      {
        url: "https://snakegamezerolog.vercel.app/og-1200x630.png",
        width: 1200,
        height: 630,
        alt: "Snake Game",
      },
    ],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://snakegamezerolog.vercel.app/og-1200x630.png",
    "fc:frame:button:1": "Play",
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
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
