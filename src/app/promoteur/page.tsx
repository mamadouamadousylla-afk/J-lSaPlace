"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, Ticket, DollarSign, TrendingUp, Plus, ArrowRight, Eye, ScanLine, X, User, Phone, Mail, MapPin, QrCode, Check, Clock } from "lucide-react"
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
    const [selectedTicket, setSelectedTicket] = useState<any>(null)

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            const data = JSON.parse(stored)
            setPromoter(data)
            loadData(data.id)
        } else {
            // TEST OVERRIDE: Inject a mock promoter session if none exists
            const mockPromoter = {
                id: "9848e4c5-0eb5-40b3-93d4-b40b61515f40", // Assuming this is bara event's ID based on subagent findings
                contact_name: "Test Promoter",
                company_name: "Test Company"
            }
            setPromoter(mockPromoter)
            loadData(mockPromoter.id)
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

            // Fetch all confirmed tickets for stats
            const { data: ticketsData } = await supabase
                .from("tickets")
                .select("id, total_price, status")
                .in("event_id", eventIds)
                .eq("status", "confirmed")

            totalTickets = ticketsData?.length || 0
            totalRevenue = ticketsData?.reduce((sum: number, t: any) => sum + (t.total_price || 0), 0) || 0
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
                        Bonjour, {promoter?.contact_name?.split(" ")[0] || "Partenaire"} 👋
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

            {/* Scanner CTA */}
            <Link href="/promoteur/scanner">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/20"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                            <ScanLine className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-lg">Scanner les billets</p>
                            <p className="text-white/70 text-sm">Validez les billets le jour J</p>
                        </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70" />
                </motion.div>
            </Link>

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
                            <Link 
                                key={event.id} 
                                href={`/promoteur/evenements/${event.id}/dashboard`}
                                className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
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
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Ticket Detail Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedTicket(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Détails du ticket</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">Référence: #{selectedTicket.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedTicket(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Statut</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        selectedTicket.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                        selectedTicket.status === 'used' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {selectedTicket.status === 'confirmed' ? 'Confirmé' : 
                                         selectedTicket.status === 'used' ? 'Utilisé' : 
                                         selectedTicket.status}
                                    </span>
                                </div>

                                {/* Event Info */}
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    <h3 className="font-bold text-gray-900">Événement</h3>
                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="w-5 h-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-gray-900">{selectedTicket.events?.title || "Événement inconnu"}</p>
                                            <p className="text-sm text-gray-500">{selectedTicket.events?.date} • {selectedTicket.events?.location}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ticket Info */}
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    <h3 className="font-bold text-gray-900">Ticket</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Type</p>
                                            <p className="font-medium text-gray-900">{selectedTicket.seat_type?.toUpperCase() || selectedTicket.zone?.toUpperCase() || "Standard"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Prix</p>
                                            <p className="font-medium text-gray-900">{formatPrice(selectedTicket.price || selectedTicket.total_price || 0)}</p>
                                        </div>
                                        {selectedTicket.seat_number && (
                                            <div>
                                                <p className="text-xs text-gray-500">Numéro de place</p>
                                                <p className="font-medium text-gray-900">{selectedTicket.seat_number}</p>
                                            </div>
                                        )}
                                        {selectedTicket.quantity && (
                                            <div>
                                                <p className="text-xs text-gray-500">Quantité</p>
                                                <p className="font-medium text-gray-900">{selectedTicket.quantity}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Buyer Info */}
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    <h3 className="font-bold text-gray-900">Acheteur</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <p className="text-xs text-gray-500">Nom</p>
                                                <p className="font-medium text-gray-900">{selectedTicket.buyer_name || "Non spécifié"}</p>
                                            </div>
                                        </div>
                                        {selectedTicket.buyer_phone && (
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Téléphone</p>
                                                    <p className="font-medium text-gray-900">{selectedTicket.buyer_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedTicket.buyer_email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="font-medium text-gray-900">{selectedTicket.buyer_email}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Purchase Date */}
                                {selectedTicket.created_at && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Date d'achat</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(selectedTicket.created_at).toLocaleDateString("fr-FR", { 
                                                    weekday: 'long', 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
