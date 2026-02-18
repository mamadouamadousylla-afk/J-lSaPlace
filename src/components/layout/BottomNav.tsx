"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Ticket, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "Accueil", icon: Home, href: "/" },
    { label: "Événements", icon: Search, href: "/evenements" },
    { label: "Tickets", icon: Ticket, href: "/mon-compte/tickets" },
    { label: "Profil", icon: User, href: "/mon-compte" },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1 transition-all duration-300",
                                isActive ? "text-primary scale-110" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <div className="w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
