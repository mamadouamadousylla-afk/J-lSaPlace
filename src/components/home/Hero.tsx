"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function Hero() {
    return (
        <div className="relative h-[80vh] w-full overflow-hidden rounded-b-[3rem] bg-primary">
            {/* Fallback pattern if image fails */}
            <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            {/* Background Image Placeholder */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2040&auto=format&fit=crop)' }}
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
                        Modou Lô <span className="text-secondary">VS</span> Siteu
                    </h1>
                    <p className="text-gray-200 text-lg font-medium max-w-md">
                        Le combat du siècle à l&apos;Arène Nationale. Ne manquez pas votre place dans l&apos;histoire.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Link href="/evenements/modou-lo-vs-siteu">
                            <button className="button-gnudem bg-secondary text-secondary-foreground px-8 py-4 flex items-center justify-center gap-2 w-full sm:w-auto">
                                Acheter mes tickets
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <button className="button-gnudem bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 w-full sm:w-auto">
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
        </div>
    )
}
