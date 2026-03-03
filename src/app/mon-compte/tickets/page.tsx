"use client"

import { useState, Suspense, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Bell, Ticket, History, Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import DynamicTicket, { DynamicTicketProps } from "@/components/shared/DynamicTicket"
import { supabase } from "@/lib/supabase"

interface TicketData extends DynamicTicketProps {
    status: "upcoming" | "past"
    downloaded?: boolean
    db_id?: string
}

function TicketsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const id = searchParams.get("id")
    const qty = searchParams.get("qty")
    const cat = searchParams.get("cat")

    const [activeTab, setActiveTab] = useState("active")
    const [displayTickets, setDisplayTickets] = useState<TicketData[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        async function loadTickets() {
            setLoading(true)
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            
            // Load tickets from localStorage (for non-logged users or fallback)
            const saved = localStorage.getItem("sunulamb_tickets")
            let currentTickets: TicketData[] = saved ? JSON.parse(saved) : []

            // If user is logged in, load tickets from Supabase
            if (user) {
                const { data: dbTickets, error } = await supabase
                    .from("tickets")
                    .select(`
                        *,
                        events:event_id (*)
                    `)
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })

                if (dbTickets && !error) {
                    // Convert DB tickets to TicketData format
                    const formattedTickets: TicketData[] = dbTickets.map((t: any) => ({
                        id: t.qr_code,
                        title: t.events?.title || "Événement",
                        date: t.events?.date || "",
                        time: t.events?.time || "",
                        location: t.events?.location || "",
                        category: t.events?.category || "SPORT",
                        zone: t.zone,
                        row: String.fromCharCode(65 + Math.floor(Math.random() * 10)),
                        seat: String(Math.floor(Math.random() * 100) + 1),
                        imageUrl: t.events?.image_url,
                        holderName: user.user_metadata?.full_name || "Titulaire",
                        status: t.status === "confirmed" ? "upcoming" : "past",
                        downloaded: false,
                        db_id: t.id
                    }))
                    
                    // Merge with local tickets (avoid duplicates)
                    const existingIds = new Set(currentTickets.map(t => t.id))
                    const newTickets = formattedTickets.filter(t => !existingIds.has(t.id))
                    currentTickets = [...newTickets, ...currentTickets]
                }
            }

            // If new purchase detected in URL (from payment flow)
            if (id && qty && cat && !user) {
                // Fetch event details from Supabase
                const { data: eventData, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", id)
                    .single()

                if (eventData) {
                    // Generate tickets for each quantity
                    for (let i = 0; i < parseInt(qty || "1"); i++) {
                        const newTicket: TicketData = {
                            id: `JSP-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}-${cat.toUpperCase()}-${i + 1}`,
                            title: eventData.title,
                            date: eventData.date,
                            time: eventData.time,
                            location: eventData.location,
                            category: eventData.category || "SPORT",
                            zone: cat.toUpperCase(),
                            row: String.fromCharCode(65 + Math.floor(Math.random() * 10)),
                            seat: String(Math.floor(Math.random() * 100) + 1),
                            imageUrl: eventData.image_url,
                            holderName: "Titulaire",
                            status: "upcoming",
                            downloaded: false
                        }

                        // Avoid duplicates
                        const exists = currentTickets.some(t => 
                            t.title === newTicket.title && 
                            t.zone === newTicket.zone && 
                            t.date === newTicket.date &&
                            t.seat === newTicket.seat
                        )
                        if (!exists) {
                            currentTickets = [newTicket, ...currentTickets]
                        }
                    }
                    localStorage.setItem("sunulamb_tickets", JSON.stringify(currentTickets))
                }
            }

            setDisplayTickets(currentTickets)
            setLoading(false)
        }

        loadTickets()
    }, [id, qty, cat])

    // Handle download - mark ticket as downloaded and remove from active view
    const handleDownload = (ticketId: string) => {
        const saved = localStorage.getItem("sunulamb_tickets")
        if (saved) {
            const tickets: TicketData[] = JSON.parse(saved)
            const updatedTickets = tickets.map(t => 
                t.id === ticketId ? { ...t, downloaded: true } : t
            )
            localStorage.setItem("sunulamb_tickets", JSON.stringify(updatedTickets))
            setDisplayTickets(updatedTickets)
        }
    }

    // Filter tickets based on active tab
    const filteredTickets = displayTickets.filter(t => {
        if (activeTab === "active") {
            return !t.downloaded && t.status === "upcoming"
        }
        return t.status === activeTab
    })

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-32">
            {/* Header with Jël Sa Place branding */}
            <header className="px-6 py-6 flex items-center justify-between bg-black sticky top-0 z-30">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white/10 border border-white/20"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex items-center gap-1">
                    <span className="text-xl font-black text-white">Jël</span>
                    <span className="text-xl font-black text-yellow-400">Sa</span>
                    <span className="text-xl font-black text-green-400">Place</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-3 rounded-full bg-white/10 border border-white/20 relative">
                        <Bell className="w-6 h-6 text-white" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-black" />
                    </button>
                </div>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/* Tabs - Only Active and History */}
                <div className="bg-gray-200 p-1.5 rounded-[1.5rem] flex">
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all ${
                            activeTab === "active" 
                                ? "bg-green-500 text-white shadow-sm" 
                                : "text-gray-500"
                        }`}
                    >
                        Mes Billets
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all ${
                            activeTab === "history" 
                                ? "bg-green-500 text-white shadow-sm" 
                                : "text-gray-500"
                        }`}
                    >
                        Historique
                    </button>
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
                    </div>
                ) : activeTab === "active" ? (
                    // Active tickets (not downloaded)
                    filteredTickets.length > 0 ? (
                        <div className="space-y-8">
                            {filteredTickets.map((ticket) => (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <DynamicTicket
                                        id={ticket.id}
                                        title={ticket.title}
                                        date={ticket.date}
                                        time={ticket.time}
                                        location={ticket.location}
                                        category={ticket.category}
                                        zone={ticket.zone}
                                        row={ticket.row}
                                        seat={ticket.seat}
                                        imageUrl={ticket.imageUrl}
                                        holderName={ticket.holderName}
                                        onDownload={() => handleDownload(ticket.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[3rem] p-12 text-center space-y-6 border border-gray-100 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                <Ticket className="w-10 h-10 text-green-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Aucun billet actif
                                </h3>
                                <p className="text-gray-500 text-sm font-medium px-4">
                                    Vous n'avez pas de billet en cours. Vos billets téléchargés sont dans l'historique.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/evenements')}
                                className="px-8 py-3.5 bg-green-500 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
                            >
                                Découvrir les événements
                            </button>
                        </motion.div>
                    )
                ) : (
                    // History view (downloaded tickets)
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <History className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Historique d'achats</h3>
                                    <p className="text-xs text-gray-500">Vos billets téléchargés</p>
                                </div>
                            </div>
                            
                            {displayTickets.filter(t => t.downloaded).length > 0 ? (
                                <div className="space-y-3">
                                    {displayTickets
                                        .filter(t => t.downloaded)
                                        .map((ticket) => (
                                            <div 
                                                key={ticket.id}
                                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                                            >
                                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Calendar className="w-6 h-6 text-green-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate">
                                                        {ticket.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {ticket.date} • {ticket.zone}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        ID: {ticket.id}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                        Téléchargé
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm">
                                        Aucun billet dans l'historique
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function TicketsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
            <TicketsContent />
        </Suspense>
    )
}
