"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    CalendarDays,
    Ticket,
    Users,
    CreditCard,
    Settings,
    LogOut,
    ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSiteSettings } from "@/context/SettingsContext"

const menuItems = [
    { icon: LayoutDashboard, label: "Vue d'ensemble", href: "/admin", exact: true },
    { icon: CalendarDays, label: "Événements", href: "/admin/events" },
    { icon: Ticket, label: "Ventes & Tickets", href: "/admin/tickets" },
    { icon: CreditCard, label: "Paiements", href: "/admin/payments" },
    { icon: Users, label: "Utilisateurs", href: "/admin/utilisateurs" },
    { icon: Settings, label: "Paramètres", href: "/admin/settings" },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { site } = useSiteSettings()

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Logo area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <img src={site.logo_url || "/logo-sunulamb.png"} alt={site.name || "SunuLamb"} className="h-6 w-auto" />
                    <span className="font-poppins font-black text-xs text-gray-500 tracking-widest uppercase">
                        Admin
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="admin-active-bg"
                                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <item.icon className={cn(
                                "w-5 h-5 transition-colors",
                                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            <span className={cn(
                                "font-bold text-sm transition-colors",
                                isActive ? "text-primary" : "text-gray-600 group-hover:text-gray-900"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <button
                    onClick={() => router.push('/')}
                    className="flex relative items-center gap-3 px-4 py-3 w-full rounded-2xl text-gray-600 hover:bg-gray-100 font-bold text-sm transition-all text-left"
                >
                    <LogOut className="w-5 h-5 text-gray-400" />
                    Voir le site
                </button>
                <button
                    onClick={() => {
                        localStorage.removeItem("admin_auth")
                        localStorage.removeItem("admin_email")
                        router.push("/admin/login")
                    }}
                    className="flex relative items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-600 hover:bg-red-50 font-bold text-sm transition-all text-left"
                >
                    <LogOut className="w-5 h-5 text-red-400" />
                    Déconnexion
                </button>
            </div>

            <div className="p-6 bg-gray-50 m-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-900">Hakim Sylla</p>
                    <p className="text-[10px] text-gray-500 font-medium">Super Admin</p>
                </div>
            </div>
        </aside>
    )
}
