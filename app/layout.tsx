import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OpenAssign",
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
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <footer className="w-full mt-12 py-8 bg-gradient-to-r from-[#f4f0e6] via-[#fcfbf8] to-[#f4f0e6] border-t border-[#e9e2ce] text-center text-[#9e8747] text-sm shadow-inner">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
              <span className="flex items-center gap-1">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block text-[#fac638] mr-1"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2 4-4" /></svg>
                All rights reserved.
              </span>
              <span className="hidden sm:inline">|</span>
              <a href="/privacy-policy" className="hover:underline hover:text-[#1c180d] transition-colors mx-2 font-medium">Privacy Policy</a>
              <span className="hidden sm:inline">|</span>
              <a href="/terms" className="hover:underline hover:text-[#1c180d] transition-colors mx-2 font-medium">Terms &amp; Conditions</a>
            </div>
          </footer>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
