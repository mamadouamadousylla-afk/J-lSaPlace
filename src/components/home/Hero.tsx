"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/context/FavoritesContext"
import { cn, formatPrice } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"

interface HeroEvent {
    id: string
    title: string
    date: string
    image_url: string
    price_vip: number
    tag: string
    featured: boolean
}

export default function Hero() {
    const { toggleFavorite, isFavorite } = useFavorites()
    const [events, setEvents] = useState<HeroEvent[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        async function loadHeroEvents() {
            // Try featured events first
            const { data: featured } = await supabase
                .from("events")
                .select("id, title, date, image_url, price_vip, tag, featured")
                .eq("status", "published")
                .eq("featured", true)
                .order("created_at", { ascending: false })

            if (featured && featured.length > 0) {
                setEvents(featured)
            } else {
                // Fallback: latest event
                const { data: latest } = await supabase
                    .from("events")
                    .select("id, title, date, image_url, price_vip, tag, featured")
                    .eq("status", "published")
                    .order("created_at", { ascending: false })
                    .limit(1)

                if (latest && latest.length > 0) setEvents(latest)
            }
            setLoading(false)
        }
        loadHeroEvents()
    }, [])

    // Auto-advance carousel when multiple events
    useEffect(() => {
        if (events.length <= 1) return
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % events.length)
        }, 4000)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [events.length])

    const goTo = (index: number) => {
        setCurrentIndex(index)
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (events.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % events.length)
            }, 4000)
        }
    }

    if (loading || events.length === 0) return null

    const event = events[currentIndex]

    return (
        <div className="px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-[420px] w-full overflow-hidden rounded-[2.5rem] bg-gray-900 shadow-xl"
            >
                {/* Background Images — animated slide */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 60 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${event.image_url || "/hero-combat.png"})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(event.id)
                    }}
                    className={cn(
                        "absolute top-6 right-6 z-20 p-3 rounded-full transition-all duration-300 shadow-lg",
                        isFavorite(event.id)
                            ? "bg-red-500 text-white scale-110"
                            : "bg-black/30 backdrop-blur-md text-white hover:bg-black/50"
                    )}
                >
                    <Heart className={cn("w-6 h-6", isFavorite(event.id) && "fill-current")} />
                </button>

                {/* Navigation arrows (only when multiple events) */}
                {events.length > 1 && (
                    <>
                        <button
                            onClick={() => goTo((currentIndex - 1 + events.length) % events.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => goTo((currentIndex + 1) % events.length)}
                            className="absolute right-16 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={event.id + "-content"}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2">
                                <span className="inline-block px-3 py-1 rounded-md bg-[#FF4B4B] text-white text-[10px] font-bold uppercase tracking-wider">
                                    {event.tag || "Populaire"}
                                </span>
                                <span className="text-white/90 text-sm font-medium">
                                    {event.date}
                                </span>
                            </div>

                            <h1 className="text-3xl font-poppins font-bold text-white leading-tight">
                                {event.title}
                            </h1>

                            <div className="w-12 h-[1px] bg-white/30" />

                            <div className="flex items-center justify-between pt-1">
                                <p className="text-white/90 font-medium">
                                    À partir de {formatPrice(event.price_vip)}
                                </p>
                                <Link href={`/evenements/${event.id}`}>
                                    <button className="bg-[#2D75B6] hover:bg-[#2D75B6]/90 text-white px-6 py-2.5 rounded-full font-medium transition-colors">
                                        Réserver
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots indicator */}
                    {events.length > 1 && (
                        <div className="flex gap-1.5 mt-4">
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
            </motion.div>
        </div>
    )
}
