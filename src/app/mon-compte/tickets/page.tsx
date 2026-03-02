"use client"

import { useState, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Bell, Ticket } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import DynamicTicket, { CATEGORY_CONFIG, DynamicTicketProps } from "@/components/shared/DynamicTicket"
import { supabase } from "@/lib/supabase"

interface TicketData extends DynamicTicketProps {
    status: "upcoming" | "past"
}

function TicketsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const id = searchParams.get("id")
    const qty = searchParams.get("qty")
    const cat = searchParams.get("cat")
    const zone = searchParams.get("zone")

    const [activeTab, setActiveTab] = useState("upcoming")
    const [displayTickets, setDisplayTickets] = useState<TicketData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTickets() {
            setLoading(true)
            
            // Load tickets from localStorage
            const saved = localStorage.getItem("sunulamb_tickets")
            let currentTickets: TicketData[] = saved ? JSON.parse(saved) : []

            // If new purchase detected in URL
            if (id && qty && cat) {
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
                            id: `SL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}-${cat.toUpperCase()}-${i + 1}`,
                            title: eventData.title,
                            date: eventData.date,
                            time: eventData.time,
                            location: eventData.location,
                            category: eventData.category || "SPORT",
                            zone: cat.toUpperCase(),
                            row: String.fromCharCode(65 + Math.floor(Math.random() * 10)), // A-J
                            seat: String(Math.floor(Math.random() * 100) + 1), // 1-100
                            imageUrl: eventData.image_url,
                            holderName: "Titulaire",
                            status: "upcoming"
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
    }, [id, qty, cat, zone])

    const handleDownload = (ticketId: string) => {
        // Simulated download
        alert(`Téléchargement du ticket ${ticketId} en PDF...`)
    }

    const handleAddToWallet = (ticketId: string) => {
        // Simulated wallet add
        alert(`Ticket ${ticketId} ajouté au wallet !`)
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-32">
            {/* Header */}
            <header className="px-6 py-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Mes Billets</h1>
                <div className="flex items-center gap-2">
                    <button className="p-3 rounded-full bg-white shadow-sm border border-gray-100 relative">
                        <Bell className="w-6 h-6 text-gray-700" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </header>

            <div className="px-4 py-6 space-y-6">
                {/* Tabs */}
                <div className="bg-gray-200 p-1.5 rounded-[1.5rem] flex">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={`flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all ${
                            activeTab === "upcoming" 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-500"
                        }`}
                    >
                        À venir
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={`flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all ${
                            activeTab === "past" 
                                ? "bg-white text-gray-900 shadow-sm" 
                                : "text-gray-500"
                        }`}
                    >
                        Passés
                    </button>
                </div>

                {/* Tickets List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                ) : displayTickets.filter(t => t.status === activeTab).length > 0 ? (
                    <div className="space-y-8">
                        {displayTickets
                            .filter(t => t.status === activeTab)
                            .map((ticket) => (
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
                                        onAddToWallet={() => handleAddToWallet(ticket.id)}
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
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                            <Ticket className="w-10 h-10 text-gray-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">
                                {activeTab === "upcoming" ? "Aucun billet à venir" : "Aucun billet passé"}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium px-4">
                                {activeTab === "upcoming" 
                                    ? "Vos billets apparaîtront ici dès que vos réservations seront confirmées." 
                                    : "Vos anciens billets apparaîtront ici après l'événement."
                                }
                            </p>
                        </div>
                        {activeTab === "upcoming" && (
                            <button
                                onClick={() => router.push('/')}
                                className="px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all text-sm"
                            >
                                Découvrir les événements
                            </button>
                        )}
                    </motion.div>
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
