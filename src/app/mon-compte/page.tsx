"use client"

import { motion } from "framer-motion"
import { User, Settings, CreditCard, Bell, MapPin, LogOut, ChevronRight, Trophy } from "lucide-react"
import Link from "next/link"

const menuItems = [
    { icon: CreditCard, label: "Historique d'achats", href: "/mon-compte/tickets", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Bell, label: "Notifications", href: "/mon-compte/notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: MapPin, label: "Arènes favorites", href: "/mon-compte/arenes", color: "text-red-500", bg: "bg-red-50" },
    { icon: Settings, label: "Paramètres", href: "/mon-compte/parametres", color: "text-gray-500", bg: "bg-gray-50" },
]

export default function ProfilePage() {
    return (
        <div className="flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-poppins font-bold text-black">Mon Compte</h1>
                <button className="p-3 rounded-full bg-slate-900 shadow-sm text-red-500">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>

            {/* User Info */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-white/10 text-center space-y-4">
                <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                        JD
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center border-4 border-slate-900">
                        <Trophy className="w-3 h-3" />
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Jean Diouf</h2>
                    <p className="text-white/60 text-sm italic">Grand Amateur de Lutte</p>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                    <div className="px-4 py-2 rounded-2xl bg-black/20">
                        <p className="text-[10px] text-white/40 font-bold uppercase">Points</p>
                        <p className="font-poppins font-bold text-white">1,250</p>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-black/20">
                        <p className="text-[10px] text-white/40 font-bold uppercase">Niveau</p>
                        <p className="font-poppins font-bold text-white">Expert</p>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-4">
                <h3 className="font-poppins font-bold px-2 text-sm text-gray-500 uppercase tracking-widest">Général</h3>
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl text-sm">
                    {menuItems.map((item, idx) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-between p-6 transition-colors hover:bg-slate-800",
                                idx !== menuItems.length - 1 && "border-b border-white/10"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", item.bg)}>
                                    <item.icon className={cn("w-5 h-5", item.color)} />
                                </div>
                                <span className="font-bold text-white">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/20" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Gamification Banner */}
            <div className="bg-gradient-to-br from-[#1B8B3D] to-[#0A5D28] p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                <div className="relative z-10 space-y-2">
                    <h4 className="font-poppins font-bold text-lg">Challenge SunuLamb 🏆</h4>
                    <p className="text-white/80 text-sm">As-tu assisté au combat du week-end ? Badge ton badge et gagne des points !</p>
                    <Link href="/mon-compte/defis">
                        <button className="button-gnudem bg-secondary text-secondary-foreground px-6 py-2 mt-2 text-xs font-bold">
                            Voir mes défis
                        </button>
                    </Link>
                </div>
            </div>

            <p className="text-center text-black font-medium text-[10px] pt-4">
                Version 1.0.0 • SunuLamb 2024
            </p>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}
