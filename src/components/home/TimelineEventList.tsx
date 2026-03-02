"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Heart } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/context/FavoritesContext"

// Fonction pour extraire le mois de la date si month_label est vide
function extractMonthFromDate(dateString: string): string {
    if (!dateString) return ""
    
    const months: Record<string, string> = {
        "janvier": "JANVIER", "jan": "JANVIER",
        "février": "FEVRIER", "fevrier": "FEVRIER", "fév": "FEVRIER", "fev": "FEVRIER",
        "mars": "MARS", "mar": "MARS",
        "avril": "AVRIL", "avr": "AVRIL",
        "mai": "MAI",
        "juin": "JUIN",
        "juillet": "JUILLET", "jui": "JUILLET",
        "août": "AOUT", "aout": "AOUT", "aug": "AOUT",
        "septembre": "SEPTEMBRE", "sep": "SEPTEMBRE",
        "octobre": "OCTOBRE", "oct": "OCTOBRE",
        "novembre": "NOVEMBRE", "nov": "NOVEMBRE",
        "décembre": "DECEMBRE", "decembre": "DECEMBRE", "déc": "DECEMBRE", "dec": "DECEMBRE"
    }
    
    const lowerDate = dateString.toLowerCase()
    for (const [month, upperMonth] of Object.entries(months)) {
        if (lowerDate.includes(month)) {
            return upperMonth
        }
    }
    return ""
}

interface EventData {
    id: string
    title: string
    date: string
    time: string
    monthLabel: string
    category: string
    categoryId: string
    price: number
    location: string
    address: string
    imageUrl: string
    description: string
    tag: string
}

interface TimelineEventListProps {
    selectedCategory: string
    searchQuery: string
}

export default function TimelineEventList({ selectedCategory, searchQuery }: TimelineEventListProps) {
    const { toggleFavorite, isFavorite } = useFavorites()
    const [events, setEvents] = useState<EventData[]>([])
    const [loading, setLoading] = useState(true)

    // Charger les événements depuis Supabase
    useEffect(() => {
        async function loadEvents() {
            setLoading(true)
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("status", "published")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Erreur lors du chargement des événements:", error)
            } else if (data) {
                console.log("Événements chargés depuis Supabase:", data.length, data.map(e => ({ id: e.id, title: e.title })))
                // Mapper les données Supabase vers le format EventData
                const mappedEvents: EventData[] = data.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.date,
                    time: event.time,
                    monthLabel: event.month_label || extractMonthFromDate(event.date),
                    category: event.category,
                    categoryId: event.category_id,
                    price: event.price_vip, // Prix VIP par défaut
                    location: event.location,
                    address: event.address || event.location,
                    imageUrl: event.image_url || "/hero-combat.png",
                    description: event.description || "",
                    tag: event.tag || event.category
                }))
                setEvents(mappedEvents)
            }
            setLoading(false)
        }

        loadEvents()

        // Souscription temps réel
        const channel = supabase
            .channel('events-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
                loadEvents()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const filteredEvents = searchQuery
        ? events.filter(e =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : (selectedCategory === "all"
            ? events
            : events.filter(e => e.categoryId === selectedCategory))

    // Helper to determine if it's the first event of the month in the current list
    const isFirstInMonth = (event: EventData, index: number) => {
        if (index === 0) return true
        return event.monthLabel !== filteredEvents[index - 1].monthLabel
    }

    return (
        <section className="px-6 space-y-6">
            <h2 className="text-xl font-poppins font-bold text-center tracking-wider text-gray-900 uppercase">À Venir</h2>

            <div className="relative pl-6 min-h-[400px]">
                {/* Dotted Timeline Line */}
                <div className="absolute left-3 top-0 bottom-0 w-[1px] border-l border-dashed border-[#2D75B6]/30" />

                <div className="space-y-6">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D75B6]"></div>
                            <p className="mt-4 text-gray-500">Chargement des événements...</p>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                            <div key={event.id} className="relative">
                                {/* Month Badge on Timeline */}
                                {isFirstInMonth(event, idx) && (
                                    <div 
                                        className="absolute -left-[32px] top-6 w-6 bg-[#FF4B4B] rounded-full flex items-center justify-center shadow-sm z-10"
                                        style={{ height: `${Math.max(72, event.monthLabel.length * 10)}px` }}
                                    >
                                        <span className="-rotate-90 text-[10px] font-bold text-white tracking-widest whitespace-nowrap">
                                            {event.monthLabel}
                                        </span>
                                    </div>
                                )}

                                {/* Event Card */}
                                <div className="relative">
                                    <Link href={`/evenements/${event.id}`}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            className="relative w-full h-[200px] rounded-[2rem] overflow-hidden shadow-lg border border-gray-100/10 group"
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                                style={{ backgroundImage: `url(${event.imageUrl})` }}
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
                                            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                                <h3 className="font-poppins font-bold text-xl text-white leading-tight">
                                                    {event.title}
                                                </h3>
                                            </div>

                                            {/* Footer Info */}
                                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                                <div className="bg-[#2D75B6] px-3 py-1.5 rounded-full">
                                                    <span className="text-white text-[10px] font-bold tracking-wider">
                                                        {event.category}
                                                    </span>
                                                </div>
                                                <span className="text-white font-bold text-sm">
                                                    {formatPrice(event.price)}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    {/* Favorite Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggleFavorite(event.id)
                                        }}
                                        className={cn(
                                            "absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300",
                                            isFavorite(event.id)
                                                ? "bg-red-500 text-white shadow-lg scale-110"
                                                : "bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                                        )}
                                    >
                                        <Heart className={cn("w-4 h-4", isFavorite(event.id) && "fill-current")} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-gray-400 font-medium italic">Aucun événement dans cette catégorie pour le moment.</p>
                            <button
                                onClick={() => {/* Category parent change would happen here */ }}
                                className="text-[#2D75B6] text-sm font-bold underline"
                            >
                                Voir tous les événements
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
