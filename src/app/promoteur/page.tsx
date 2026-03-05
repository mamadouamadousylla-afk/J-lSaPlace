"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CalendarDays, Ticket, DollarSign, TrendingUp, Plus, ArrowRight, Eye } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function formatPrice(p: number) {
    return new Intl.NumberFormat("fr-FR").format(p) + " FCFA"
}

export default function PromoterDashboard() {
    const [promoter, setPromoter] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [stats, setStats] = useState({ events: 0, tickets: 0, revenue: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            const data = JSON.parse(stored)
            setPromoter(data)
            loadData(data.id)
        }
    }, [])

    const loadData = async (promoterId: string) => {
        setLoading(true)
        // Load events for this promoter
        const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .eq("promoter_id", promoterId)
            .order("created_at", { ascending: false })

        const eventList = eventsData || []
        setEvents(eventList.slice(0, 5))

        // Load tickets for these events
        let totalTickets = 0
        let totalRevenue = 0

        if (eventList.length > 0) {
            const eventIds = eventList.map((e: any) => e.id)
            const { data: ticketsData } = await supabase
                .from("tickets")
                .select("id, price, status")
                .in("event_id", eventIds)
                .eq("status", "confirmed")

            totalTickets = ticketsData?.length || 0
            totalRevenue = ticketsData?.reduce((sum: number, t: any) => sum + (t.price || 0), 0) || 0
        }

        setStats({ events: eventList.length, tickets: totalTickets, revenue: totalRevenue })
        setLoading(false)
    }

    const statCards = [
        { icon: CalendarDays, label: "Événements", value: stats.events, color: "bg-orange-100 text-orange-500", suffix: "" },
        { icon: Ticket, label: "Billets vendus", value: stats.tickets, color: "bg-blue-100 text-blue-500", suffix: "" },
        { icon: DollarSign, label: "Revenus totaux", value: formatPrice(stats.revenue), color: "bg-green-100 text-green-500", suffix: "" },
    ]

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-poppins font-black text-gray-900">
                        Bonjour, {promoter?.contact_name?.split(" ")[0] || "Promoteur"} 👋
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">{promoter?.company_name}</p>
                </div>
                <Link href="/promoteur/evenements/nouveau"
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Nouvel événement</span>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s, i) => (
                    <motion.div key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-gray-900">{loading ? "—" : s.value}</p>
                        <p className="text-gray-500 text-sm font-medium mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Mes événements récents</h2>
                    <Link href="/promoteur/evenements" className="flex items-center gap-1 text-sm text-orange-500 font-bold hover:underline">
                        Voir tout <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="p-12 text-center">
                        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucun événement créé</p>
                        <Link href="/promoteur/evenements/nouveau"
                            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors">
                            <Plus className="w-4 h-4" />
                            Créer votre premier événement
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {events.map((event) => (
                            <div key={event.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 overflow-hidden flex-shrink-0">
                                    {event.image_url
                                        ? <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                        : <CalendarDays className="w-6 h-6 text-orange-300 m-3" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{event.title}</p>
                                    <p className="text-xs text-gray-500">{event.date} • {event.location}</p>
                                </div>
                                <Link href={`/promoteur/statistiques?event=${event.id}`}
                                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                                    <Eye className="w-4 h-4 text-gray-600" />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
