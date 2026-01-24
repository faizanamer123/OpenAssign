import type React from "react"
import type { Metadata } from "next"
import { Lexend, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Chatbot from "@/components/Chatbot";
import Logo from "@/components/ui/Logo";
import ConditionalFooter from "@/components/ConditionalFooter";

const lexend = Lexend({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-lexend"
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-playfair"
})

export const metadata: Metadata = {
  title: "AssignDump",
  description: "Anonymous assignment solving platform for university students"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/OpenAssign.png"  type="image/png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lexend:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${lexend.variable} ${playfair.variable} font-display`}>
        <AuthProvider>
          {children}
          <ConditionalFooter />
          <Toaster />
          <Chatbot />
        </AuthProvider>
        <Analytics/>
        <SpeedInsights />
      </body>
    </html>
  )
}
