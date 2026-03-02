"use client"

import { useFavorites } from "@/context/FavoritesContext"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { Heart, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface EventData {
    id: string
    title: string
    date: string
    image_url: string
    category: string
    price_vip: number
}

export default function FavorisPage() {
    const { favorites, toggleFavorite, isFavorite } = useFavorites()
    const router = useRouter()
    const [allEvents, setAllEvents] = useState<EventData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadEvents() {
            const { data } = await supabase
                .from("events")
                .select("id, title, date, image_url, category, price_vip")
                .eq("status", "published")
            
            if (data) {
                setAllEvents(data)
            }
            setLoading(false)
        }
        loadEvents()
    }, [])

    const favoriteEvents = allEvents.filter(e => favorites.includes(e.id))

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 pb-24">
            {/* Header */}
            <div className="px-6 pt-14 pb-6 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-gray-100 text-gray-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-poppins font-bold text-gray-900">Mes Favoris</h1>
                {favoriteEvents.length > 0 && (
                    <span className="ml-auto bg-[#2D75B6] text-white text-xs font-bold px-3 py-1 rounded-full">
                        {favoriteEvents.length}
                    </span>
                )}
            </div>

            {favoriteEvents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                        <Heart className="w-12 h-12 text-gray-300" />
                    </div>
                    <h2 className="text-xl font-poppins font-bold text-gray-900">Aucun favori</h2>
                    <p className="text-gray-400 font-medium">
                        Appuyez sur le ♥ pour ajouter des événements à vos favoris et les retrouver ici.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 px-8 py-3 bg-[#2D75B6] text-white font-bold rounded-2xl shadow-lg"
                    >
                        Découvrir les événements
                    </Link>
                </div>
            ) : (
                <div className="px-6 space-y-4">
                    {favoriteEvents.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div className="relative">
                                <Link href={`/evenements/${event.id}`}>
                                    <div className="relative w-full h-[180px] rounded-[2rem] overflow-hidden shadow-lg group">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                            style={{ backgroundImage: `url(${event.image_url || "/hero-combat.png"})` }}
                                        />
                                        <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />

                                        {/* Date Badge */}
                                        <div className="absolute top-4 left-4">
                                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                                <span className="text-white text-xs font-medium tracking-wide">
                                                    {event.date}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="absolute inset-0 flex items-center justify-center p-6">
                                            <h3 className="font-poppins font-bold text-xl text-white text-center leading-tight">
                                                {event.title}
                                            </h3>
                                        </div>

                                        {/* Footer */}
                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                            <div className="bg-[#2D75B6] px-3 py-1.5 rounded-full">
                                                <span className="text-white text-[10px] font-bold tracking-wider">
                                                    {event.category}
                                                </span>
                                            </div>
                                            <span className="text-white font-bold text-sm">
                                                {formatPrice(event.price_vip)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>

                                {/* Favorite Button */}
                                <button
                                    onClick={() => toggleFavorite(event.id)}
                                    className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-red-500 border border-red-500 text-white"
                                >
                                    <Heart className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
