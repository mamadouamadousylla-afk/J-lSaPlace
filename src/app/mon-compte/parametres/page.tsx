"use client"

import { motion } from "framer-motion"
import { Settings, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-1 hover:scale-110 transition-transform"
                >
                    <ArrowLeft className="w-7 h-7 text-[#2D75B6]" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                        <Settings className="w-5 h-5 text-[#2D75B6]" />
                    </div>
                    <h1 className="text-3xl font-poppins font-black text-[#2D75B6]">Paramètres</h1>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <h3 className="font-poppins font-black text-gray-300 uppercase tracking-widest text-lg px-2">Contact</h3>

                <div className="bg-[#F8FAFC] rounded-[2rem] overflow-hidden shadow-sm">
                    <a 
                        href="sms:+221781757502" 
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-100 transition-colors border-b border-gray-100/50 block"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                <span className="text-xl">💬</span>
                            </div>
                            <div>
                                <span className="font-bold text-[#2D75B6] text-sm">Envoyez nous un SMS</span>
                                <p className="text-xs text-gray-500">+221 78 175 75 02</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5 text-white transform rotate-180" />
                        </div>
                    </a>

                    <a 
                        href="https://api.whatsapp.com/send/?phone=221781757502" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-100 transition-colors border-b border-gray-100/50 block"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                <span className="text-xl">💬</span>
                            </div>
                            <div>
                                <span className="font-bold text-[#2D75B6] text-sm">Rejoignez-nous sur WhatsApp</span>
                                <p className="text-xs text-gray-500">https://api.whatsapp.com/...</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5 text-white transform rotate-180" />
                        </div>
                    </a>

                    <a 
                        href="tel:+221781757502" 
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-100 transition-colors block"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                <span className="text-xl">📞</span>
                            </div>
                            <div>
                                <span className="font-bold text-[#2D75B6] text-sm">Appelez nous directement</span>
                                <p className="text-xs text-gray-500">+221 78 175 75 02</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center">
                            <ArrowLeft className="w-5 h-5 text-white transform rotate-180" />
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
