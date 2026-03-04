"use client"

import AdminSidebar from "@/components/admin/AdminSidebar"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Vérifier si l'utilisateur est authentifié
        const adminAuth = localStorage.getItem("admin_auth")
        
        if (!adminAuth && pathname !== "/admin/login") {
            // Rediriger vers la page de login
            router.push("/admin/login")
        } else {
            setIsAuthenticated(true)
        }
        setLoading(false)
    }, [pathname, router])

    // Safety check just in case, though this file only affects /admin
    if (!pathname.startsWith('/admin')) {
        return <>{children}</>
    }

    // Page de login — pas de sidebar
    if (pathname === "/admin/login") {
        return <>{children}</>
    }

    // Chargement
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A8744]"></div>
            </div>
        )
    }

    // Non authentifié — ne rien afficher (redirection en cours)
    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Desktop Left Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                <div className="font-sans antialiased max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
