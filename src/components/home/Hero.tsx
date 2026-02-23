"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronRight, X } from "lucide-react"
import { useState } from "react"
import Antigravity from "@/components/shared/Antigravity"

export default function Hero() {
    const [showAffiche, setShowAffiche] = useState(false)

    return (
        <div className="relative h-[80vh] w-full overflow-hidden rounded-b-[3rem] bg-primary">
            {/* Fallback pattern if image fails */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-top"
                style={{ backgroundImage: 'url(/hero-combat.png)' }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end p-8 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <span className="inline-block px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                        Événement Phare
                    </span>
                    <h1 className="text-4xl md:text-6xl font-poppins font-bold text-white leading-tight">
                        Modou Lô <span className="text-secondary">VS</span> Sa Thiès
                    </h1>
                    <p className="text-white text-lg font-medium max-w-md">
                        Le combat du siècle à l&apos;Arène Nationale. Ne manquez pas votre place dans l&apos;histoire.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href="/evenements/1" className="w-full sm:w-auto">
                            <button className="button-gnudem bg-secondary text-secondary-foreground px-8 py-4 flex items-center justify-center gap-2 w-full">
                                Acheter mes tickets
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <button
                            onClick={() => setShowAffiche(true)}
                            className="button-gnudem bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 w-full sm:w-auto"
                        >
                            Voir l&apos;affiche
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Progress Indicator (Gamified) */}
            <div className="absolute top-12 left-8 right-8 flex gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-white/40 overflow-hidden">
                    <motion.div
                        className="h-full bg-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                </div>
                <div className="h-1.5 flex-1 rounded-full bg-white/20" />
                <div className="h-1.5 flex-1 rounded-full bg-white/20" />
            </div>

            {/* Modal for Affiche */}
            <AnimatePresence>
                {showAffiche && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    >
                        <button
                            onClick={() => setShowAffiche(false)}
                            className="absolute top-8 right-8 p-3 rounded-full bg-white/10 text-white"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <Antigravity yOffset={20} duration={3}>
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                src="/hero-combat.png"
                                className="max-w-full max-h-[90vh] rounded-3xl shadow-2xl object-contain object-center"
                                alt="Affiche du combat"
                            />
                        </Antigravity>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
