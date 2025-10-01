import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Snake Game - Hızlı ve klasik yılan",
  description: "Tarayıcıda akıcı, dokunmatik destekli klasik yılan oyunu.",
  generator: "v0.app",
  manifest: "/manifest.json",
  openGraph: {
    title: "Snake Game",
    description: "Base üzerinde keşfedilebilir hızlı bir mini oyun.",
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
    "fc:frame:button:1": "Oyna",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
