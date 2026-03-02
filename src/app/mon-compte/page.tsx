"use client" // Update: Synchronized with GitHub

import { motion } from "framer-motion"
import { User, Settings, CreditCard, Bell, LogOut, ChevronRight, Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const menuItems = [
    { icon: CreditCard, label: "Historique d'achats", href: "/mon-compte/tickets", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Bell, label: "Notifications", href: "/mon-compte/notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Settings, label: "Paramètres", href: "/mon-compte/parametres", color: "text-gray-500", bg: "bg-gray-50" },
]

export default function ProfilePage() {
    const router = useRouter()

    return (
        <div className="relative flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            {/* Filigrane African Pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                    backgroundImage: "url(/fond-lamb.png)",
                    backgroundSize: "300px 300px",
                    backgroundRepeat: "repeat"
                }}
            />
            <div className="relative z-10 flex flex-col space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-poppins font-black text-[#2D2D2D]">Mon Profile</h1>
                        <span className="text-2xl">😊</span>
                    </div>
                    <button
                        onClick={() => router.push('/mon-compte/parametres')}
                        className="p-3 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-[#2D75B6] hover:scale-110 transition-transform"
                    >
                        <Settings className="w-6 h-6 fill-current" />
                    </button>
                </div>

                {/* Illustration & User Name */}
                <div className="flex flex-col items-center justify-center py-4 space-y-8 relative">
                    <div className="relative w-64 h-64">
                        {/* Background dots */}
                        <div className="absolute top-10 left-4 w-4 h-4 rounded-full bg-blue-300 opacity-60" />
                        <div className="absolute top-1/4 -left-4 w-3 h-3 rounded-full bg-orange-200 opacity-60" />
                        <div className="absolute top-0 right-10 w-4 h-4 rounded-full bg-blue-400 opacity-60" />
                        <div className="absolute bottom-1/4 -right-2 w-4 h-4 rounded-full bg-blue-300 opacity-60" />
                        <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full bg-orange-200 opacity-60" />
                        <div className="absolute top-1/2 -right-8 w-2 h-2 rounded-full bg-blue-400 opacity-60" />

                        {/* Central Illustration */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <svg viewBox="0 0 200 200" className="w-full h-full">
                                <circle cx="100" cy="100" r="70" fill="none" stroke="#2D75B6" strokeWidth="12" strokeDasharray="380 440" strokeLinecap="round" transform="rotate(-90 100 100)" />
                                <rect x="155" y="105" width="40" height="12" rx="4" fill="#FF7043" />
                                <path d="M100 65 C115 65 125 75 125 90 C125 105 115 115 100 115 C85 115 75 105 75 90 C75 75 85 65 100 65 Z" fill="#FF7043" />
                                <path d="M65 145 C65 125 80 115 100 115 C120 115 135 125 135 145 L135 155 L65 155 Z" fill="#FF7043" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-poppins font-bold text-[#2D2D2D] tracking-tight">hakim sylla</h2>
                </div>

                {/* Menu Sections */}
                <div className="space-y-4">
                    <h3 className="font-poppins font-bold px-2 text-sm text-gray-500 uppercase tracking-widest">Général</h3>
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-lg text-sm">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between p-6 transition-colors hover:bg-gray-50",
                                    idx !== menuItems.length - 1 && "border-b border-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", item.bg)}>
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                    </div>
                                    <span className="font-bold text-gray-900">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                    <p className="text-black font-medium text-[10px] flex items-center gap-1">
                        ©2026 Azerty Agency • All rights reserved
                    </p>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
