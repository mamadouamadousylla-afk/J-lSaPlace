"use client"

import { motion } from "framer-motion"
import { Settings, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-slate-900 shadow-sm text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-poppins font-bold text-black">Paramètres</h1>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Settings className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Paramètres bientôt disponibles</h2>
                    <p className="text-slate-500">Nous travaillons sur de nouvelles options pour vous.</p>
                </div>
            </div>
        </div>
    )
}
