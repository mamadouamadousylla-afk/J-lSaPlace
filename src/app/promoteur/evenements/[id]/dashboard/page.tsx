"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CalendarDays, Ticket, DollarSign, Users, TrendingUp, Eye, MapPin, Clock } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function formatPrice(p: number) {
    return new Intl.NumberFormat("fr-FR").format(p) + " FCFA"
}

export default function EventDashboard() {
    const router = useRouter()
    const params = useParams()
    const eventId = params.id as string

    const [promoter, setPromoter] = useState<any>(null)
    const [event, setEvent] = useState<any>(null)
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalTickets: 0,
        revenue: 0,
        attendees: 0
    })
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (eventId) {
                loadEventData()
                setLastUpdate(new Date())
            }
        }, 10000) // 10 seconds

        return () => clearInterval(interval)
    }, [eventId])

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            setPromoter(JSON.parse(stored))
            loadEventData()
        }
    }, [eventId])

    const loadEventData = async () => {
        setLoading(true)
        
        // Load event details
        const { data: eventData } = await supabase
            .from("events")
            .select("*")
            .eq("id", eventId)
            .single()

        if (eventData) {
            setEvent(eventData)
            
            // Load tickets for this event
            const { data: ticketsData } = await supabase
                .from("tickets")
                .select(`
                    *,
                    events(title)
                `)
                .eq("event_id", eventId)
                .in("status", ["confirmed", "used"])
                .order("created_at", { ascending: false })

            setTickets(ticketsData || [])
            
            // Calculate stats
            const totalTickets = ticketsData?.length || 0
            const revenue = ticketsData?.reduce((sum: number, t: any) => sum + (t.total_price || 0), 0) || 0
            const attendees = ticketsData?.reduce((sum: number, t: any) => sum + (t.quantity || 1), 0) || 0
            
            setStats({ totalTickets, revenue, attendees })
        }
        
        setLoading(false)
    }

    const statCards = [
        { icon: Ticket, label: "Tickets vendus", value: stats.totalTickets, color: "bg-blue-100 text-blue-500" },
        { icon: Users, label: "Participants", value: stats.attendees, color: "bg-green-100 text-green-500" },
        { icon: DollarSign, label: "Revenus", value: formatPrice(stats.revenue), color: "bg-orange-100 text-orange-500" },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        )
    }

    if (!event) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900">Événement non trouvé</h2>
                <Link href="/promoteur/evenements" className="mt-4 inline-block text-orange-500 hover:underline">
                    Retour aux événements
                </Link>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/promoteur/evenements" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-poppins font-black text-gray-900">Dashboard - {event.title}</h1>
                    <p className="text-sm text-gray-500">{event.date} • {event.location}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                    Mis à jour à {lastUpdate.toLocaleTimeString("fr-FR", { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                    })}
                </div>
            </div>

            {/* Event Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h2 className="font-bold text-gray-900 mb-3">Détails de l'événement</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CalendarDays className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium">{event.date} à {event.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Lieu</p>
                                    <p className="font-medium">{event.location}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Ticket className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Catégorie</p>
                                    <p className="font-medium">{event.category}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {event.image_url && (
                        <div className="md:w-48">
                            <img 
                                src={event.image_url} 
                                alt={event.title}
                                className="w-full h-32 object-cover rounded-xl"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map((s, i) => (
                    <motion.div 
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        <p className="text-gray-500 text-sm font-medium mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Inventaire des Tickets ({tickets.length})</h2>
                    <div className="p-2 rounded-xl bg-blue-50">
                        <Ticket className="w-4 h-4 text-blue-500" />
                    </div>
                </div>

                {tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">Aucun ticket vendu pour le moment</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Référence</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Acheteur</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type de Ticket</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date d'achat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono font-bold text-gray-900 text-sm">#{ticket.qr_code?.slice(-6).toUpperCase() || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {(ticket.buyer_name?.charAt(0) || 'A').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{ticket.buyer_name || "Anonyme"}</p>
                                                    {ticket.buyer_phone && (
                                                        <p className="text-xs text-gray-500">{ticket.buyer_phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700">
                                                {ticket.zone?.toUpperCase() || "Standard"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-black text-gray-900 text-sm">
                                                {formatPrice(ticket.total_price || 0)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                                ticket.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                ticket.status === 'used' ? 'bg-gray-100 text-gray-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                                {ticket.status === 'confirmed' ? 'Validé' : 
                                                 ticket.status === 'used' ? 'Utilisé' : 
                                                 ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            {new Date(ticket.created_at).toLocaleDateString("fr-FR", {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
