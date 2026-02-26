"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart } from "lucide-react"
import { allEvents } from "@/lib/events"
import { useFavorites } from "@/context/FavoritesContext"
import { cn, formatPrice } from "@/lib/utils"

export default function Hero() {
    const { toggleFavorite, isFavorite } = useFavorites()
    const heroEvent = allEvents[0] // Using the first event (Grand Gala de Lutte) as hero

    if (!heroEvent) return null

    return (
        <div className="px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-xl"
            >
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroEvent.imageUrl})` }}
                />

                {/* Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(heroEvent.id)
                    }}
                    className={cn(
                        "absolute top-6 right-6 z-20 p-3 rounded-full transition-all duration-300 shadow-lg",
                        isFavorite(heroEvent.id)
                            ? "bg-red-500 text-white scale-110"
                            : "bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
                    )}
                >
                    <Heart className={cn("w-6 h-6", isFavorite(heroEvent.id) && "fill-current")} />
                </button>

                <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-3 py-1 rounded-md bg-[#FF4B4B] text-white text-[10px] font-bold uppercase tracking-wider">
                                {heroEvent.tag || "Populaire"}
                            </span>
                            <span className="text-white/90 text-sm font-medium">
                                {heroEvent.date}
                            </span>
                        </div>

                        <h1 className="text-3xl font-poppins font-bold text-white leading-tight">
                            {heroEvent.title}
                        </h1>

                        <div className="w-12 h-[1px] bg-white/30 my-4" />

                        <div className="flex items-center justify-between pt-2">
                            <p className="text-white/90 font-medium">
                                À partir de {formatPrice(heroEvent.price)}
                            </p>

                            <Link href={`/evenements/${heroEvent.id}`}>
                                <button className="bg-[#2D75B6] hover:bg-[#2D75B6]/90 text-white px-6 py-2.5 rounded-full font-medium transition-colors">
                                    Réserver
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

