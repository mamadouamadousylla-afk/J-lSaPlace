"use client"

import { useState, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Bell, Download, QrCode, Calendar, MapPin, ArrowRight, Ticket } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import Qoder from "@/components/shared/Qoder"
import { getEventById } from "@/lib/events"

interface TicketData {
    id: string
    title: string
    date: string
    time: string
    location: string
    category: string
    zone: string
    row?: string
    seat?: string
    imageUrl: string
    status: "upcoming" | "past"
}

function TicketsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const id = searchParams.get("id")
    const qty = searchParams.get("qty")
    const cat = searchParams.get("cat")

    const [activeTab, setActiveTab] = useState("upcoming")
    const [displayTickets, setDisplayTickets] = useState<TicketData[]>([])

    useEffect(() => {
        // Load tickets from localStorage
        const saved = localStorage.getItem("sunulamb_tickets")
        let currentTickets: TicketData[] = saved ? JSON.parse(saved) : []

        // If new purchase detected in URL
        if (id && qty && cat) {
            const event = getEventById(id)
            if (event) {
                const newTicket: TicketData = {
                    id: `SL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}-${cat.toUpperCase()}`,
                    title: event.title,
                    date: event.date,
                    time: event.time,
                    location: event.location,
                    category: event.tag || event.category,
                    zone: cat.toUpperCase(),
                    row: "B",
                    seat: Math.floor(Math.random() * 50).toString(),
                    imageUrl: event.imageUrl,
                    status: "upcoming"
                }

                // Avoid duplicates on refresh if possible (simple check)
                const exists = currentTickets.some(t => t.title === newTicket.title && t.category === newTicket.category && t.date === newTicket.date)
                if (!exists) {
                    currentTickets = [newTicket, ...currentTickets]
                    localStorage.setItem("sunulamb_tickets", JSON.stringify(currentTickets))
                }
            }
        }

        setDisplayTickets(currentTickets)
    }, [id, qty, cat])

    const [expandedTicket, setExpandedTicket] = useState<string | null>(null)

    // Set first ticket as expanded if just purchased
    useEffect(() => {
        if (displayTickets.length > 0 && (id || !expandedTicket)) {
            setExpandedTicket(displayTickets[0].id)
        }
    }, [displayTickets, id])

    const handleDownload = (ticketId: string) => {
        // Simulated download
        alert(`Téléchargement du ticket ${ticketId} en PDF...`)
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] pb-32">
            {/* Header */}
            <header className="px-6 py-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100"
                >
                    <ChevronLeft className="w-6 h-6 text-[#2D75B6]" />
                </button>
                <h1 className="text-xl font-poppins font-black text-[#1A2D42]">Mes Billets</h1>
                <div className="flex items-center gap-2">
                    <button className="p-3 rounded-full bg-white shadow-sm border border-gray-100 relative">
                        <Bell className="w-6 h-6 text-[#2D75B6]" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#FF4B4B] rounded-full border-2 border-white" />
                    </button>
                </div>
            </header>

            <div className="px-6 py-6 space-y-6">
                {/* Tabs */}
                <div className="bg-[#E9ECEF] p-1.5 rounded-[1.5rem] flex">
                    <button
                        onClick={() => setActiveTab("upcoming")}
                        className={cn(
                            "flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all",
                            activeTab === "upcoming" ? "bg-[#2D75B6] text-white shadow-lg" : "text-[#8E9AAF]"
                        )}
                    >
                        À venir
                    </button>
                    <button
                        onClick={() => setActiveTab("past")}
                        className={cn(
                            "flex-1 py-3.5 rounded-[1.25rem] font-bold text-sm transition-all",
                            activeTab === "past" ? "bg-[#2D75B6] text-white shadow-lg" : "text-[#8E9AAF]"
                        )}
                    >
                        Passés
                    </button>
                </div>

                {/* Tickets List */}
                <div className="space-y-6">
                    {displayTickets.filter(t => t.status === activeTab).length > 0 ? (
                        displayTickets.filter(t => t.status === activeTab).map((ticket) => (
                            <motion.div
                                key={ticket.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100"
                            >
                                <div className="p-6 flex gap-6">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-sm flex-shrink-0">
                                        <img src={ticket.imageUrl || "/hero-combat.png"} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-[#2D75B6] uppercase tracking-wider bg-[#F0F7FF] px-2 py-0.5 rounded-full inline-block w-fit">
                                                {ticket.category}
                                            </span>
                                            <h3 className="text-lg font-bold text-[#1A2D42] leading-tight mt-1">{ticket.title}</h3>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[#A6ADB9]">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-medium">{ticket.date} • {ticket.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#A6ADB9]">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span className="text-[11px] font-medium">{ticket.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-2 grid grid-cols-3 gap-4 border-t border-gray-50 border-dashed relative">
                                    {/* Tear-off side circles */}
                                    <div className="absolute -left-3 top-[-12px] w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />
                                    <div className="absolute -right-3 top-[-12px] w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />

                                    <div>
                                        <p className="text-[9px] font-bold text-[#A6ADB9] uppercase tracking-widest">ZONE</p>
                                        <p className="text-sm font-black text-[#2D75B6]">{ticket.zone}</p>
                                    </div>
                                    {ticket.row && (
                                        <div>
                                            <p className="text-[9px] font-bold text-[#A6ADB9] uppercase tracking-widest">RANGÉE</p>
                                            <p className="text-sm font-black text-[#1A2D42]">{ticket.row}</p>
                                        </div>
                                    )}
                                    {ticket.seat && (
                                        <div>
                                            <p className="text-[9px] font-bold text-[#A6ADB9] uppercase tracking-widest">SIÈGE</p>
                                            <p className="text-sm font-black text-[#1A2D42]">{ticket.seat}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-50 border-dashed pt-4" />

                                <div className="px-6 pb-8">
                                    <AnimatePresence mode="wait">
                                        {expandedTicket === ticket.id ? (
                                            <motion.div
                                                key="expanded"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-6 flex flex-col items-center"
                                            >
                                                <div className="bg-[#F8F9FA] p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-center relative">
                                                    <Qoder value={ticket.id} size={140} />
                                                    <div className="absolute -bottom-4 bg-white px-4 py-1 rounded-full shadow-sm border border-gray-50">
                                                        <p className="text-[10px] font-mono text-[#A6ADB9] tracking-widest uppercase">ID: {ticket.id}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleDownload(ticket.id)}
                                                    className="w-full py-4.5 rounded-[1.5rem] bg-[#2D75B6] text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-500/10 active:scale-[0.98] transition-all"
                                                >
                                                    <Download className="w-5 h-5" />
                                                    Enregistrer PDF
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <button
                                                key="collapsed"
                                                onClick={() => setExpandedTicket(ticket.id)}
                                                className="w-full py-4 rounded-[1.5rem] border-2 border-gray-100 text-[#1A2D42] font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <QrCode className="w-5 h-5 text-[#2D75B6]" />
                                                Afficher le QR
                                            </button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))
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
                                <h3 className="text-xl font-bold text-[#1A2D42]">Aucun billet ici</h3>
                                <p className="text-[#A6ADB9] text-sm font-medium px-4">
                                    Vos billets apparaîtront ici dès que vos réservations seront confirmées.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className="px-8 py-3.5 bg-[#2D75B6] text-white font-bold rounded-2xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all text-sm"
                            >
                                Découvrir les combats
                            </button>
                        </motion.div>
                    )}
                </div>
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
