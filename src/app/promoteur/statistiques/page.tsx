"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { BarChart2, Ticket, DollarSign, TrendingUp, CalendarDays, ChevronDown } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function StatistiquesContent() {
    const searchParams = useSearchParams()
    const selectedEventId = searchParams.get("event")

    const [promoter, setPromoter] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [currentEvent, setCurrentEvent] = useState<any>(null)
    const [stats, setStats] = useState({ tickets: 0, revenue: 0, zones: [] as any[] })
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showEventPicker, setShowEventPicker] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            const data = JSON.parse(stored)
            setPromoter(data)
            loadEvents(data.id)
        }
    }, [])

    const loadEvents = async (promoterId: string) => {
        const { data } = await supabase
            .from("events")
            .select("*")
            .eq("promoter_id", promoterId)
            .order("created_at", { ascending: false })
        const evts = data || []
        setEvents(evts)
        if (evts.length > 0) {
            const target = selectedEventId ? evts.find((e: any) => e.id === selectedEventId) : evts[0]
            if (target) loadEventStats(target)
            else loadEventStats(evts[0])
        } else {
            setLoading(false)
        }
    }

    const loadEventStats = async (event: any) => {
        setCurrentEvent(event)
        setLoading(true)
        const { data: ticketData } = await supabase
            .from("tickets")
            .select("*")
            .eq("event_id", event.id)
            .in("status", ["confirmed", "used"])
        const t = ticketData || []
        setTickets(t)

        const revenue = t.reduce((sum: number, tk: any) => sum + (tk.total_price || 0), 0)

        // Group by zone
        const pricing = event.pricing || {}
        const pricingLabels = event.pricing_labels || {}
        const seats = event.seats || {}

        const zoneStats = Object.keys(pricing).map(key => {
            const sold = t.filter((tk: any) => tk.zone?.toLowerCase() === key.toLowerCase()).length
            return {
                label: pricingLabels[key] || key.toUpperCase(),
                sold,
                total: seats[key] || 0,
                price: pricing[key] || 0,
                color: key.toLowerCase() === "vip" ? "bg-yellow-400" : "bg-blue-400"
            }
        })

        // Fallback for old events without dynamic pricing
        if (zoneStats.length === 0) {
            zoneStats.push(
                { label: "VIP", sold: t.filter(tk => tk.zone?.toLowerCase() === "vip").length, total: event.seats_vip || 0, price: event.price_vip || 0, color: "bg-yellow-400" },
                { label: "Tribune", sold: t.filter(tk => tk.zone?.toLowerCase() === "tribune").length, total: event.seats_tribune || 0, price: event.price_tribune || 0, color: "bg-blue-400" },
                { label: "Pelouse", sold: t.filter(tk => tk.zone?.toLowerCase() === "pelouse").length, total: event.seats_pelouse || 0, price: event.price_pelouse || 0, color: "bg-green-400" }
            )
        }

        setStats({ tickets: t.length, revenue, zones: zoneStats })
        setLoading(false)
    }

    const totalSeats = stats.zones.reduce((sum, z) => sum + z.total, 0) || (currentEvent?.seats_vip || 0) + (currentEvent?.seats_tribune || 0) + (currentEvent?.seats_pelouse || 0)
    const fillRate = totalSeats > 0 ? Math.round((stats.tickets / totalSeats) * 100) : 0
    const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n)

    if (events.length === 0 && !loading) return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-poppins font-black text-gray-900 mb-6">Statistiques</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <BarChart2 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-700 text-lg">Aucun événement</h3>
                <p className="text-gray-400 text-sm mt-1 mb-6">Créez un événement pour voir ses statistiques</p>
                <Link href="/promoteur/evenements/nouveau"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors">
                    Créer un événement
                </Link>
            </div>
        </div>
    )

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-poppins font-black text-gray-900">Statistiques</h1>
                    <p className="text-gray-500 text-sm mt-1">Performances de vos événements</p>
                </div>
                {events.length > 1 && (
                    <div className="relative">
                        <button onClick={() => setShowEventPicker(!showEventPicker)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm hover:border-orange-400 transition-colors">
                            <CalendarDays className="w-4 h-4 text-orange-500" />
                            <span className="max-w-[180px] truncate">{currentEvent?.title || "Choisir"}</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                        {showEventPicker && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
                                {events.map(e => (
                                    <button key={e.id} onClick={() => { loadEventStats(e); setShowEventPicker(false) }}
                                        className={`w-full px-4 py-3 text-left text-sm hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0 ${currentEvent?.id === e.id ? "bg-orange-50 font-bold text-orange-600" : "text-gray-700"}`}>
                                        {e.title}
                                        <span className="block text-xs text-gray-400 mt-0.5">{e.date}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {currentEvent && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                        {currentEvent.image_url
                            ? <img src={currentEvent.image_url} alt="" className="w-full h-full object-cover" />
                            : <CalendarDays className="w-8 h-8 text-orange-300 m-4" />
                        }
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{currentEvent.title}</h3>
                        <p className="text-sm text-gray-500">{currentEvent.date} — {currentEvent.location}</p>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Ticket, label: "Billets vendus", value: stats.tickets, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
                            { icon: DollarSign, label: "Revenus totaux", value: `${fmt(stats.revenue)} FCFA`, iconBg: "bg-green-100", iconColor: "text-green-600" },
                            { icon: TrendingUp, label: "Taux de remplissage", value: `${fillRate}%`, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
                            { icon: BarChart2, label: "Places disponibles", value: totalSeats - stats.tickets, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
                        ].map(({ icon: Icon, label, value, iconBg, iconColor }, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-2xl border border-gray-100 p-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
                                    <Icon className={`w-5 h-5 ${iconColor}`} />
                                </div>
                                <p className="text-xl font-black text-gray-900">{value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                        <h3 className="font-bold text-gray-900">Ventes par catégorie</h3>
                        {stats.zones.map(({ label, sold, total, price, color }) => {
                            const pct = total > 0 ? Math.round((sold / total) * 100) : 0
                            return (
                                <div key={label} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-bold text-gray-800">{label}</span>
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <span>{sold}/{total} billets</span>
                                            <span className="font-bold text-gray-900">{fmt(sold * price)} FCFA</span>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
                                            className={`h-full rounded-full ${color}`} />
                                    </div>
                                    <p className="text-xs text-gray-400">{pct}% vendus</p>
                                </div>
                            )
                        })}
                    </div>

                    {tickets.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                            <h3 className="font-bold text-gray-900">Billets récents</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {tickets.slice(0, 20).map(tk => (
                                    <div key={tk.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                                        <div>
                                            <p className="font-bold text-gray-800">{tk.buyer_name || "Acheteur"}</p>
                                            <p className="text-xs text-gray-400">{tk.seat_type?.toUpperCase()} — N°{tk.seat_number}</p>
                                        </div>
                                        <span className="font-bold text-gray-900">{fmt(tk.price || 0)} F</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default function StatistiquesPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" /></div>}>
            <StatistiquesContent />
        </Suspense>
    )
}
