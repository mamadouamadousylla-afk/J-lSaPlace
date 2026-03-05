"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Plus, Search, Edit2, BarChart2, Trash2, MapPin, Clock, Eye } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PromoterEventsPage() {
    const router = useRouter()
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [promoter, setPromoter] = useState<any>(null)
    const [deleting, setDeleting] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            const data = JSON.parse(stored)
            setPromoter(data)
            loadEvents(data.id)
        }
    }, [])

    const loadEvents = async (promoterId: string) => {
        setLoading(true)
        const { data } = await supabase
            .from("events")
            .select("*")
            .eq("promoter_id", promoterId)
            .order("created_at", { ascending: false })
        setEvents(data || [])
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Supprimer cet événement ?")) return
        setDeleting(id)
        await supabase.from("events").delete().eq("id", id)
        setEvents(prev => prev.filter(e => e.id !== id))
        setDeleting(null)
    }

    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
    )

    const statusColor = (status: string) => {
        if (status === "published") return "bg-green-100 text-green-700"
        if (status === "draft") return "bg-gray-100 text-gray-600"
        return "bg-yellow-100 text-yellow-700"
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-poppins font-black text-gray-900">Mes Événements</h1>
                    <p className="text-gray-500 text-sm mt-1">{events.length} événement{events.length > 1 ? "s" : ""}</p>
                </div>
                <Link href="/promoteur/evenements/nouveau"
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                    <Plus className="w-4 h-4" />
                    Nouvel événement
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Rechercher un événement..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
            </div>

            {/* Events List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <CalendarDays className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-700 text-lg">Aucun événement</h3>
                    <p className="text-gray-400 text-sm mt-1 mb-6">Créez votre premier événement de lutte</p>
                    <Link href="/promoteur/evenements/nouveau"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                        <Plus className="w-4 h-4" />
                        Créer un événement
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((event, i) => (
                        <motion.div key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="flex items-center gap-4 p-5">
                                {/* Image */}
                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                                    {event.image_url
                                        ? <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                        : <CalendarDays className="w-8 h-8 text-orange-300 m-6" />
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-bold text-gray-900 truncate">{event.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(event.status)}`}>
                                            {event.status === "published" ? "Publié" : event.status === "draft" ? "Brouillon" : event.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />{event.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />{event.location}
                                        </span>
                                    </div>
                                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                        <span>VIP: {new Intl.NumberFormat("fr-FR").format(event.price_vip || 0)} F</span>
                                        <span>Tribune: {new Intl.NumberFormat("fr-FR").format(event.price_tribune || 0)} F</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Link href={`/promoteur/statistiques?event=${event.id}`}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                                        <BarChart2 className="w-3.5 h-3.5" />
                                        Stats
                                    </Link>
                                    <Link href={`/promoteur/evenements/${event.id}/modifier`}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors">
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Modifier
                                    </Link>
                                    <button onClick={() => handleDelete(event.id)} disabled={deleting === event.id}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {deleting === event.id ? "..." : "Supprimer"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
