"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Calendar } from "lucide-react"
import EventCard from "@/components/shared/EventCard"
import { cn, formatPrice } from "@/lib/utils"

const allEvents = [
    {
        id: "1",
        title: "Modou Lô vs Siteu",
        date: "24 Nov 2024",
        location: "Arène Nationale, Dakar",
        price: 5000,
        imageUrl: "/hero-combat.png",
        status: "disponible" as const
    },
    {
        id: "2",
        title: "Balla Gaye 2 vs Eumeu Sène",
        date: "15 Déc 2024",
        location: "Arène Nationale, Dakar",
        price: 3000,
        imageUrl: "https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=400",
        status: "presque-complet" as const
    },
    {
        id: "3",
        title: "Reug Reug vs Bombardier",
        date: "4 Jan 2025",
        location: "Grand Stade de Mbour",
        price: 2500,
        imageUrl: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&q=80&w=400",
        status: "disponible" as const
    },
    {
        id: "4",
        title: "Gris Bordeaux vs Ama Baldé",
        date: "2 Fév 2025",
        location: "Arène Nationale, Dakar",
        price: 4000,
        imageUrl: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=400",
        status: "disponible" as const
    }
]

export default function EventsList() {
    const [search, setSearch] = useState("")

    const filteredEvents = allEvents.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black p-6 pt-16 pb-32 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-poppins font-bold">Événements</h1>
                <p className="text-gray-500 text-sm">Trouvez les meilleurs combats de la saison.</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un lutteur ou une arène..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-sm"
                />
                <button className="absolute inset-y-2 right-2 p-3 rounded-2xl bg-primary text-white">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Categories / Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
                {["Tous", "Vanguard", "Espoirs", "Gala", "Lutte Simple"].map((tab, i) => (
                    <button
                        key={tab}
                        className={cn(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            i === 0 ? "bg-primary text-white" : "bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredEvents.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden flex shadow-sm">
                            <div className="w-32 h-full min-h-[160px] relative">
                                <img src={event.imageUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-primary/10" />
                            </div>
                            <div className="flex-1 p-6 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg leading-tight">{event.title}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                        <Calendar className="w-3 h-3 text-primary" />
                                        {event.date}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <p className="font-poppins font-bold text-primary">{formatPrice(event.price)}</p>
                                    <button
                                        onClick={() => window.location.href = `/evenements/${event.id}`}
                                        className="px-6 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-bold"
                                    >
                                        Tickets
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="text-center py-20 space-y-4">
                    <p className="text-gray-400 italic">Aucun événement trouvé pour &quot;{search}&quot;</p>
                    <button onClick={() => setSearch("")} className="text-primary font-bold underline">Effacer la recherche</button>
                </div>
            )}
        </div>
    )
}

