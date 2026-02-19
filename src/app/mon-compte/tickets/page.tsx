"use client"

import { motion } from "framer-motion"
import { Ticket, Download, ArrowLeft, Calendar, MapPin, Share2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useRouter } from "next/navigation"

export default function TicketsPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 p-6 pt-16 pb-32 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-poppins font-bold text-white">Mes Tickets</h1>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                    <Ticket className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-3">
                <h2 className="text-xl font-bold text-white">Jërejëf ! Ton ticket est prêt.</h2>
                <div className="bg-white px-4 py-2 rounded-full inline-block">
                    <p className="text-black text-xs font-bold font-poppins">Présentez ce QR Code à l&apos;entrée de l&apos;arène.</p>
                </div>
            </div>

            {/* Main Ticket */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative"
            >
                <div className="bg-white dark:bg-gray-900 rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
                    {/* Ticket Header (Combat Image) */}
                    <div className="h-40 w-full relative">
                        <img
                            src="/hero-combat.png"
                            className="w-full h-full object-cover object-top"
                            alt="Combat"
                        />
                        <div className="absolute inset-0 bg-primary/40 mix-blend-multiply" />
                        <div className="absolute bottom-4 left-6">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase border border-white/30">
                                Ticket Valide
                            </span>
                        </div>
                    </div>

                    <div className="p-8 space-y-8 relative bg-slate-900">
                        {/* Cutout circles for ticket look */}
                        <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-slate-950 -translate-y-1/2" />
                        <div className="absolute -right-4 top-0 w-8 h-8 rounded-full bg-slate-950 -translate-y-1/2" />

                        <div className="space-y-1">
                            <h3 className="text-2xl font-poppins font-bold text-white">Modou Lô vs Sa Thiès</h3>
                            <div className="flex items-center gap-4 text-white/60 text-xs mt-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    <span className="text-white">5 Avr, 16h</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-primary" />
                                    <span className="text-white">Tribune</span>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center space-y-4 py-4">
                            <div className="p-6 bg-white rounded-[2rem] shadow-inner border border-gray-50">
                                <QRCodeSVG
                                    value="https://sunulamb.sn/v/ticket-123456"
                                    size={180}
                                    fgColor="#1B8B3D"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em]">SL-883-X92-2024</p>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 border-dashed">
                            <button className="flex-1 button-gnudem bg-secondary text-secondary-foreground py-4 flex items-center justify-center gap-2">
                                <Download className="w-5 h-5" />
                                Télécharger PDF
                            </button>
                            <button className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats / Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Porte d&apos;entrée</p>
                    <p className="text-xl font-poppins font-bold text-primary">Zone B</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Catégorie</p>
                    <p className="text-xl font-poppins font-bold text-primary">Tribune</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-green-700 p-8 rounded-[2.5rem] text-white">
                <h4 className="font-bold mb-2">Conseil de Sécurité</h4>
                <p className="text-sm text-white/80">Ne partagez jamais votre QR Code sur les réseaux sociaux. Chaque code est unique et à usage unique.</p>
            </div>
        </div>
    )
}
