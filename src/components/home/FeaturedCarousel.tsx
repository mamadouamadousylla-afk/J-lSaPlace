"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/context/FavoritesContext"
import { cn, formatPrice } from "@/lib/utils"

interface FeaturedEvent {
    id: string
    title: string
    date: string
    image_url: string
    price_vip: number
    tag: string
    location: string
}

export default function FeaturedCarousel() {
    const { toggleFavorite, isFavorite } = useFavorites()
    const [events, setEvents] = useState<FeaturedEvent[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        async function loadFeaturedEvents() {
            const { data } = await supabase
                .from("events")
                .select("id, title, date, image_url, price_vip, tag, location")
                .eq("status", "published")
                .eq("featured", true)
                .order("created_at", { ascending: false })

            if (data && data.length > 0) {
                setEvents(data)
            }
            setLoading(false)
        }
        loadFeaturedEvents()
    }, [])

    // Auto-advance carousel
    useEffect(() => {
        if (events.length <= 1) return
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % events.length)
        }, 4000)
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [events.length])

    const goTo = (index: number) => {
        setCurrentIndex(index)
        // Reset auto-advance timer
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % events.length)
        }, 4000)
    }

    if (loading || events.length === 0) return null

    const event = events[currentIndex]

    return (
        <div className="px-6 space-y-3">
            {/* Section header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <h2 className="text-xl font-poppins font-bold text-gray-900">Populaire</h2>
                </div>
                <Link href="/evenements" className="text-[#2D75B6] font-medium text-sm">
                    Voir tout
                </Link>
            </div>

            {/* Carousel card */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-[2rem] bg-gray-900 shadow-xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        {/* Background image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${event.image_url || "/hero-combat.png"})` }}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Favorite button */}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(event.id)
                    }}
                    className={cn(
                        "absolute top-5 right-5 z-20 p-2.5 rounded-full transition-all duration-300 shadow-lg",
                        isFavorite(event.id)
                            ? "bg-red-500 text-white scale-110"
                            : "bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
                    )}
                >
                    <Heart className={cn("w-5 h-5", isFavorite(event.id) && "fill-current")} />
                </button>

                {/* Navigation arrows */}
                {events.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo((currentIndex - 1 + events.length) % events.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => goTo((currentIndex + 1) % events.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={event.id + "-content"}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className="inline-block px-3 py-1 rounded-md bg-[#FF4B4B] text-white text-[10px] font-bold uppercase tracking-wider">
                                    {event.tag || "Populaire"}
                                </span>
                                <span className="text-white/90 text-sm font-medium">{event.date}</span>
                            </div>
                            <h3 className="text-2xl font-poppins font-bold text-white leading-tight">
                                {event.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <p className="text-white/80 font-medium text-sm">
                                    À partir de {formatPrice(event.price_vip)}
                                </p>
                                <Link href={`/evenements/${event.id}`}>
                                    <button className="bg-[#2D75B6] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#2D75B6]/90 transition-colors shadow-lg">
                                        Réserver
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Dots indicator */}
                {events.length > 1 && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                        {events.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                className={cn(
                                    "rounded-full transition-all duration-300",
                                    i === currentIndex
                                        ? "w-5 h-1.5 bg-white"
                                        : "w-1.5 h-1.5 bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
