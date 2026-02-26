"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { allEvents, EventData } from "@/lib/events"
import { useFavorites } from "@/context/FavoritesContext"

interface TimelineEventListProps {
    selectedCategory: string
    searchQuery: string
}

export default function TimelineEventList({ selectedCategory, searchQuery }: TimelineEventListProps) {
    const { toggleFavorite, isFavorite } = useFavorites()

    const filteredEvents = searchQuery
        ? allEvents.filter(e =>
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : (selectedCategory === "all"
            ? allEvents
            : allEvents.filter(e => e.categoryId === selectedCategory))

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
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, idx) => (
                            <div key={event.id} className="relative">
                                {/* Month Badge on Timeline */}
                                {isFirstInMonth(event, idx) && (
                                    <div className="absolute -left-[32px] top-6 w-6 h-16 bg-[#FF4B4B] rounded-full flex items-center justify-center shadow-sm z-10">
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
