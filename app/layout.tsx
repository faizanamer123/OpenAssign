import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from "@vercel/speed-insights/next";
import Chatbot from "@/components/Chatbot";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-nunito"
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
      </head>
      <body className={`${nunito.variable} font-nunito`}>
        <AuthProvider>
          {children}
          <footer className="w-full mt-12 py-8 reddit-dark-bg border-t border-[#4ade80]/20 text-center text-gray-300 text-sm shadow-inner">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
              <span className="flex items-center gap-1">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-[#4ade80] mr-1"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" /></svg>
                All rights reserved.
              </span>
              <span className="hidden sm:inline">|</span>
              <a href="/privacy-policy" className="hover:underline hover:text-white transition-colors mx-2 font-medium">Privacy Policy</a>
              <span className="hidden sm:inline">|</span>
              <a href="/terms" className="hover:underline hover:text-white transition-colors mx-2 font-medium">Terms &amp; Conditions</a>
            </div>
          </footer>
          <Toaster />
          <Chatbot />
        </AuthProvider>
        <Analytics/>
        <SpeedInsights />
      </body>
    </html>
  )
}
