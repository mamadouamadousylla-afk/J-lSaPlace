"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Ticket, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { label: "DÉCOUVRIR", icon: Compass, href: "/" },
    { label: "BILLETS", icon: Ticket, href: "/mon-compte/tickets" },
    { label: "FAVORIS", icon: Heart, href: "/favoris" },
    { label: "PROFIL", icon: User, href: "/mon-compte" },
]

export default function BottomNav() {
    const pathname = usePathname()

    // Hide on admin routes completely
    if (pathname.startsWith('/admin')) return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50">
            <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center space-y-1.5 transition-all duration-300 w-full",
                                isActive ? "text-[#2D75B6]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <div className="relative">
                                <item.icon className={cn("w-6 h-6", isActive && "stroke-[2.5px] fill-current")} />
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold tracking-wider",
                                isActive ? "text-[#2D75B6]" : "font-semibold text-gray-400"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

