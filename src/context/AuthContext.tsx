"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface CustomUser {
    id: string
    full_name: string
    first_name: string
    last_name: string
    phone: string
    email?: string
    points?: number
    avatar_url?: string
    created_at: string
}

interface AuthContextType {
    user: User | CustomUser | null
    session: Session | null
    loading: boolean
    sendOTP: (phone: string) => Promise<{ error?: string }>
    verifyOTP: (phone: string, token: string) => Promise<{ error?: string }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | CustomUser | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check custom session from localStorage first
        const stored = localStorage.getItem("user_session")
        if (stored) {
            try { setUser(JSON.parse(stored)) } catch {}
        }

        // Get initial Supabase session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session?.user) setUser(session.user)
            setLoading(false)
        })

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
                if (session?.user) setUser(session.user)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const sendOTP = async (phone: string) => {
        const res = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone })
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error }
        return {}
    }

    const verifyOTP = async (phone: string, token: string) => {
        const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, token })
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error }

        // Set the session in Supabase client
        await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token ?? ""
        })
        return {}
    }

    const signOut = async () => {
        localStorage.removeItem("user_session")
        setUser(null)
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, sendOTP, verifyOTP, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used within AuthProvider")
    return ctx
}
