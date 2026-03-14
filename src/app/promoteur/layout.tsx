"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { LayoutDashboard, CalendarDays, BarChart2, Settings, LogOut, Building2, Menu, X, ScanLine } from "lucide-react"

const menuItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/promoteur" },
    { icon: CalendarDays, label: "Mes Événements", href: "/promoteur/evenements" },
    { icon: ScanLine, label: "Scanner billets", href: "/promoteur/scanner" },
    { icon: BarChart2, label: "Statistiques", href: "/promoteur/statistiques" },
    { icon: Settings, label: "Mon Profil", href: "/promoteur/profil" },
]

function cn(...inputs: any[]) { return inputs.filter(Boolean).join(" ") }

export default function PromoterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [promoter, setPromoter] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenu, setMobileMenu] = useState(false)

    // Skip auth check for login and inscription pages
    const isLoginPage = pathname === "/promoteur/login" || pathname === "/promoteur/inscription"

    useEffect(() => {
        if (isLoginPage) {
            setLoading(false)
            return
        }
        const checkAuth = async () => {
            const stored = localStorage.getItem("promoter_session")
            if (!stored) {
                router.push("/promoteur/login")
                return
            }
            try {
                const data = JSON.parse(stored)
                setPromoter(data)
            } catch {
                router.push("/promoteur/login")
            }
            setLoading(false)
        }
        checkAuth()
    }, [router, isLoginPage])

    const handleLogout = () => {
        localStorage.removeItem("promoter_session")
        router.push("/promoteur/login")
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        )
    }

    // Render login page without sidebar
    if (isLoginPage) {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-50">
                {/* Logo */}
                <div className="h-20 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-gray-900 text-sm">Espace Partenaire</p>
                            <p className="text-xs text-gray-400 truncate max-w-[130px]">{promoter?.company_name}</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = item.href === "/promoteur"
                            ? pathname === item.href
                            : pathname.startsWith(item.href)
                        return (
                            <Link key={item.href} href={item.href}
                                className="relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group"
                            >
                                {isActive && (
                                    <motion.div layoutId="promoter-active-bg"
                                        className="absolute inset-0 bg-orange-500/10 rounded-2xl -z-10"
                                        initial={false} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-colors",
                                    isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600")} />
                                <span className={cn("font-bold text-sm transition-colors",
                                    isActive ? "text-orange-500" : "text-gray-600 group-hover:text-gray-900")}>
                                    {item.label}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center font-bold text-orange-500 text-sm">
                            {promoter?.contact_name?.charAt(0) || "P"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{promoter?.contact_name}</p>
                            <p className="text-xs text-gray-400 truncate">{promoter?.email || promoter?.phone}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm">
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile header */}
                <div className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-black text-gray-900 text-sm">Espace Partenaire</span>
                    </div>
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2">
                        {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenu && (
                    <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 space-y-1">
                        {menuItems.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50">
                                <item.icon className="w-5 h-5 text-orange-500" />
                                {item.label}
                            </Link>
                        ))}
                        <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50">
                            <LogOut className="w-5 h-5" />
                            Se déconnecter
                        </button>
                    </div>
                )}

                {children}
            </main>
        </div>
    )
}
