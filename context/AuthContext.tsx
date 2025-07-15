"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types/assignment"
import { generateUsername } from "@/utils/usernameGenerator"
import { getUsers, createUser } from "@/utils/api"

interface AuthContextType {
  user: User | null
  signInWithEmail: (email: string) => Promise<User>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("openassign_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signInWithEmail = async (email: string) => {
    setLoading(true)
    try {
      // Check if user exists in backend
      const users = await getUsers()
      let existing = users.find((u: any) => u.email === email)
      let userObj
      if (existing) {
        userObj = existing
      } else {
        // Generate a unique username
        let username
        let taken = true
        while (taken) {
          username = generateUsername()
          taken = users.some((u: any) => u.username === username)
        }
        userObj = await createUser({
          email,
          username,
          points: 0,
        })
      }
      setUser(userObj)
      localStorage.setItem("openassign_user", JSON.stringify(userObj))
      return userObj // <-- return user object
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem("openassign_user")
  }

  return <AuthContext.Provider value={{ user, signInWithEmail, signOut, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
