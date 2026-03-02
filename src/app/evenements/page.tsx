"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter } from "lucide-react"
import EventCard from "@/components/shared/EventCard"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface EventData {
    id: string
    title: string
    date: string
    location: string
    price_vip: number
    image_url: string
    category: string
}

export default function EventsList() {
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState("Tous")
    const [events, setEvents] = useState<EventData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadEvents() {
            const { data } = await supabase
                .from("events")
                .select("id, title, date, location, price_vip, image_url, category")
                .eq("status", "published")
                .order("created_at", { ascending: false })

            if (data) {
                setEvents(data)
            }
            setLoading(false)
        }
        loadEvents()
    }, [])

    // Obtenir les catégories uniques
    const categories = ["Tous", ...new Set(events.map(e => e.category))]

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = activeCategory === "Tous" || e.category === activeCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="relative flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            {/* Filigrane African Pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                    backgroundImage: "url(/fond-lamb.png)",
                    backgroundSize: "300px 300px",
                    backgroundRepeat: "repeat"
                }}
            />
            <div className="relative z-10 flex flex-col space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-poppins font-bold text-black">Événements</h1>
                <p className="text-gray-600 text-sm font-medium">Trouvez les meilleurs combats de la saison.</p>
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
                    className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-gray-900 placeholder:text-gray-400 text-sm"
                />
                <button className="absolute inset-y-2 right-2 p-3 rounded-2xl bg-primary text-white">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Categories / Tabs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-6 px-6">
                {categories.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveCategory(tab)}
                        className={cn(
                            "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all",
                            activeCategory === tab ? "bg-primary text-white" : "bg-gray-100 text-gray-600 border border-gray-200"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
                {filteredEvents.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="w-full max-w-[320px]"
                    >
                        <EventCard 
                            id={event.id}
                            title={event.title}
                            date={event.date}
                            location={event.location}
                            price={event.price_vip}
                            imageUrl={event.image_url || "/hero-combat.png"}
                            status="disponible"
                        />
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
        </div>
    )
}

