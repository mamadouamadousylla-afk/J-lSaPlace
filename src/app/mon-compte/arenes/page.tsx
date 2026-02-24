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

            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <MapPin className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-black">Aucune arène favorite</h2>
                    <p className="text-slate-500">Ajoutez des arènes à vos favoris pour les retrouver ici.</p>
                </div>
            </div>

            {/* Arène Nationale du Sénégal Section */}
            <div className="mt-8">
                <a 
                    href="https://maps.google.com/?q=Arène+Nationale+du+Sénégal,+QJ72+P7,+Pikine" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <div className="w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.686566835263!2d-17.4069874!3d14.7303961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec10d48e891398d%3A0x629530403333333!2sAr%C3%A8ne%20Nationale%20de%20Lutte!5e0!3m2!1sfr!2ssn!4v1709900000000!5m2!1sfr!2ssn">
                        </iframe>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-sm font-bold text-gray-900">Arène Nationale du Sénégal</p>
                        <p className="text-xs text-gray-500">QJ72+P7, Pikine</p>
                    </div>
                </a>
            </div>
        </div>
    )
}
