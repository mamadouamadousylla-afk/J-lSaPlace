"use client"

import { motion } from "framer-motion"
import { MapPin, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ArenesPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-slate-900 shadow-sm text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-poppins font-bold text-black">Arènes Favorites</h1>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <MapPin className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Aucune arène favorite</h2>
                    <p className="text-slate-500">Ajoutez des arènes à vos favoris pour les retrouver ici.</p>
                </div>
            </div>
        </div>
    )
}
