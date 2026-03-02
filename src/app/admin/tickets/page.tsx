"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
    Search, Download, Filter, CheckCircle, AlertCircle, X, 
    MoreHorizontal, ChevronLeft, ChevronRight, Shield, Clock, XCircle,
    QrCode, Camera
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatNumber, cn } from "@/lib/utils"
import QRScanner from "@/components/admin/QRScanner"

export default function AdminTickets() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [showScanner, setShowScanner] = useState(false)
    const [showManualEntry, setShowManualEntry] = useState(false)
    const [manualTicketId, setManualTicketId] = useState("")
    const [validatingManual, setValidatingManual] = useState(false)
    const [manualValidationResult, setManualValidationResult] = useState<any>(null)
    const [showNotification, setShowNotification] = useState(false)
    const [notificationData, setNotificationData] = useState({ type: 'success', title: '', message: '' })
    
    const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
    const ITEMS_PER_PAGE = 10

    // Stats
    const [stats, setStats] = useState({
        validated: 0,
        pending: 0,
        cancelled: 0,
        total: 0
    })

    useEffect(() => {
        loadTickets()

        const channel = supabase
            .channel('tickets-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
                loadTickets()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId) {
                const dropdown = dropdownRefs.current[openMenuId];
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setOpenMenuId(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    async function loadTickets() {
        setLoading(true)
        
        const { data } = await supabase
            .from("tickets")
            .select(`
                id,
                zone,
                quantity,
                total_price,
                status,
                created_at,
                events ( title, date ),
                users ( full_name, phone )
            `)
            .order("created_at", { ascending: false })
            .limit(100)

        if (data) {
            setTickets(data)
            setStats({
                validated: data.filter(t => t.status === 'confirmed' || t.status === 'used').length,
                pending: data.filter(t => t.status === 'pending').length,
                cancelled: data.filter(t => t.status === 'cancelled').length,
                total: data.length
            })
        }
        setLoading(false)
    }

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = searchTerm === "" ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.events?.title?.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeFilter === "all") return matchesSearch
        if (activeFilter === "vip") return matchesSearch && ticket.zone?.toLowerCase().includes('vip')
        if (activeFilter === "pending") return matchesSearch && ticket.status === 'pending'
        
        return matchesSearch
    })

    // Pagination
    const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedTickets = filteredTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const showNotificationToast = (type: 'success' | 'error', title: string, message: string) => {
        setNotificationData({ type, title, message })
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 4000)
    }

    const handleScanSuccess = (result: any) => {
        if (result.success) {
            showNotificationToast('success', 'Accès Autorisé', `Ticket validé pour ${result.ticket?.events?.title || 'l\'événement'}`)
            loadTickets()
        }
    }

    // Manual ticket validation
    async function validateManualTicket() {
        if (!manualTicketId.trim()) return
        
        setValidatingManual(true)
        setManualValidationResult(null)

        try {
            // Search for ticket by ID (partial match)
            const searchTerm = manualTicketId.trim().replace('#', '').replace('SL-', '')
            
            const { data: tickets, error } = await supabase
                .from("tickets")
                .select(`
                    id,
                    zone,
                    quantity,
                    total_price,
                    status,
                    created_at,
                    events ( id, title, date, location ),
                    users ( full_name, phone )
                `)
                .or(`id.ilike.%${searchTerm}%,qr_code.ilike.%${searchTerm}%`)
                .limit(1)

            if (error || !tickets || tickets.length === 0) {
                setManualValidationResult({
                    success: false,
                    message: "Ticket non trouvé. Vérifiez l'ID saisi."
                })
                setValidatingManual(false)
                return
            }

            const ticket = tickets[0]

            if (ticket.status === "used") {
                setManualValidationResult({
                    success: false,
                    message: "Ce ticket a déjà été utilisé",
                    ticket
                })
                setValidatingManual(false)
                return
            }

            if (ticket.status === "cancelled") {
                setManualValidationResult({
                    success: false,
                    message: "Ce ticket a été annulé",
                    ticket
                })
                setValidatingManual(false)
                return
            }

            // Mark as used if confirmed
            if (ticket.status === "confirmed") {
                await supabase
                    .from("tickets")
                    .update({ status: "used" })
                    .eq("id", ticket.id)
            }

            setManualValidationResult({
                success: true,
                message: "Ticket validé avec succès !",
                ticket
            })

            showNotificationToast('success', 'Accès Autorisé', `Ticket validé pour ${(ticket.events as any)?.title || 'l\'événement'}`)
            loadTickets()

        } catch (err) {
            console.error("Erreur validation:", err)
            setManualValidationResult({
                success: false,
                message: "Erreur lors de la vérification"
            })
        }
        
        setValidatingManual(false)
    }

    function closeManualEntry() {
        setShowManualEntry(false)
        setManualTicketId("")
        setManualValidationResult(null)
    }

    // Status config
    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; bg: string; dot: string; label: string }> = {
            confirmed: { color: "text-green-600", bg: "bg-green-100", dot: "bg-green-500", label: "VALIDÉ" },
            used: { color: "text-green-600", bg: "bg-green-100", dot: "bg-green-500", label: "UTILISÉ" },
            pending: { color: "text-orange-600", bg: "bg-orange-100", dot: "bg-orange-500", label: "EN ATTENTE" },
            cancelled: { color: "text-red-600", bg: "bg-red-100", dot: "bg-red-500", label: "ANNULÉ" }
        }
        return configs[status] || configs.pending
    }

    // Category badge
    const getCategoryBadge = (zone: string) => {
        if (zone?.toLowerCase().includes('vip')) {
            return { label: "VIP GOLD", bg: "bg-emerald-100", text: "text-emerald-700" }
        }
        if (zone?.toLowerCase().includes('tribune')) {
            return { label: "STANDARD", bg: "bg-blue-100", text: "text-blue-700" }
        }
        return { label: "PELOUSE", bg: "bg-gray-100", text: "text-gray-700" }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] -m-8 p-8">
            {/* QR Scanner Modal */}
            <QRScanner 
                isOpen={showScanner} 
                onClose={() => setShowScanner(false)}
                onScanSuccess={handleScanSuccess}
            />

            {/* Manual Entry Modal */}
            {showManualEntry && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Entrée Manuelle</h2>
                                        <p className="text-blue-100 text-sm">Validez un ticket par son ID</p>
                                    </div>
                                </div>
                                <button
                                    onClick={closeManualEntry}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Input */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ID du ticket ou code QR
                                    </label>
                                    <input
                                        type="text"
                                        value={manualTicketId}
                                        onChange={(e) => setManualTicketId(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') validateManualTicket()
                                        }}
                                        placeholder="Collez l'ID du ticket ou scannez le code..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Ex: SL-A1B2C3 ou #SL-A1B2C3 ou le code QR complet
                                    </p>
                                </div>

                                {/* Validate Button */}
                                <button
                                    onClick={validateManualTicket}
                                    disabled={validatingManual || !manualTicketId.trim()}
                                    className={cn(
                                        "w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                                        validatingManual || !manualTicketId.trim()
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                                    )}
                                >
                                    {validatingManual ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Validation en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="w-4 h-4" />
                                            Valider le ticket
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Result */}
                            {manualValidationResult && (
                                <div className={cn(
                                    "mt-4 rounded-2xl p-4",
                                    manualValidationResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                                )}>
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            manualValidationResult.success ? "bg-green-100" : "bg-red-100"
                                        )}>
                                            {manualValidationResult.success ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn(
                                                "font-bold",
                                                manualValidationResult.success ? "text-green-700" : "text-red-700"
                                            )}>
                                                {manualValidationResult.success ? "Accès Autorisé" : "Accès Refusé"}
                                            </p>
                                            <p className={cn(
                                                "text-sm mt-1",
                                                manualValidationResult.success ? "text-green-600" : "text-red-600"
                                            )}>
                                                {manualValidationResult.message}
                                            </p>

                                            {manualValidationResult.ticket && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">ID</span>
                                                        <span className="font-mono font-bold">#{manualValidationResult.ticket.id.slice(0, 8).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Événement</span>
                                                        <span className="font-medium">{(manualValidationResult.ticket.events as any)?.title}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Acheteur</span>
                                                        <span className="font-medium">{(manualValidationResult.ticket.users as any)?.full_name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Zone</span>
                                                        <span className="font-bold">{manualValidationResult.ticket.zone}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Places</span>
                                                        <span className="font-bold">{manualValidationResult.ticket.quantity}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={() => {
                                        setManualTicketId("")
                                        setManualValidationResult(null)
                                    }}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Nouveau
                                </button>
                                <button
                                    onClick={closeManualEntry}
                                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Notification Toast */}
            {showNotification && (
                <motion.div
                    initial={{ opacity: 0, y: -20, x: "50%" }}
                    animate={{ opacity: 1, y: 0, x: "50%" }}
                    exit={{ opacity: 0 }}
                    className="fixed top-4 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-sm"
                >
                    <div className="flex items-start gap-3">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            notificationData.type === 'success' ? "bg-green-100" : "bg-red-100"
                        )}>
                            {notificationData.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900">{notificationData.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{notificationData.message}</p>
                        </div>
                        <button onClick={() => setShowNotification(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventaire des Tickets</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez et validez les entrées aux événements</p>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            placeholder="Recherche rapide..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                    </div>
                    
                    {/* QR Scanner Button */}
                    <button 
                        onClick={() => setShowScanner(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-colors"
                    >
                        <QrCode className="w-4 h-4" />
                        Scanner
                    </button>

                    {/* Manual Entry Button */}
                    <button 
                        onClick={() => setShowManualEntry(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors"
                    >
                        <Shield className="w-4 h-4" />
                        Entrée Manuelle
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
                {[
                    { id: "all", label: "Tous les tickets", count: stats.total },
                    { id: "vip", label: "VIP uniquement", count: tickets.filter(t => t.zone?.toLowerCase().includes('vip')).length },
                    { id: "pending", label: "En attente", count: stats.pending }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveFilter(tab.id); setCurrentPage(1) }}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                            activeFilter === tab.id
                                ? "bg-white shadow-sm text-gray-900"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        {tab.label}
                        {activeFilter === tab.id && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                {formatNumber(tab.count)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tickets Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Référence</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acheteur</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Événement</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                    </td>
                                </tr>
                            ) : paginatedTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        Aucun ticket trouvé
                                    </td>
                                </tr>
                            ) : paginatedTickets.map((ticket, idx) => {
                                const statusConfig = getStatusConfig(ticket.status)
                                const categoryBadge = getCategoryBadge(ticket.zone)
                                
                                return (
                                    <motion.tr
                                        key={ticket.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-semibold text-gray-900">
                                                #SL-{ticket.id.slice(0, 5).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {(ticket.users?.full_name || 'U').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-900 block">{ticket.users?.full_name || 'Anonyme'}</span>
                                                    <span className="text-xs text-gray-400">{ticket.users?.phone || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-700">{ticket.events?.title || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-xs font-semibold",
                                                categoryBadge.bg, categoryBadge.text
                                            )}>
                                                {categoryBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-2 h-2 rounded-full", statusConfig.dot)}></div>
                                                <span className={cn("text-sm font-medium", statusConfig.color)}>
                                                    {statusConfig.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative" ref={(el) => { dropdownRefs.current[ticket.id] = el }}>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                                </button>
                                                
                                                {openMenuId === ticket.id && (
                                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                                        <button
                                                            onClick={() => setOpenMenuId(null)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Voir détails
                                                        </button>
                                                        {ticket.status === 'pending' && (
                                                            <button
                                                                onClick={async () => {
                                                                    await supabase.from("tickets").update({ status: "confirmed" }).eq("id", ticket.id)
                                                                    loadTickets()
                                                                    showNotificationToast('success', 'Ticket validé', 'Le ticket a été confirmé')
                                                                    setOpenMenuId(null)
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50"
                                                            >
                                                                Valider
                                                            </button>
                                                        )}
                                                        {ticket.status !== 'cancelled' && ticket.status !== 'used' && (
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm("Annuler ce ticket ?")) {
                                                                        await supabase.from("tickets").update({ status: "cancelled" }).eq("id", ticket.id)
                                                                        loadTickets()
                                                                        showNotificationToast('success', 'Ticket annulé', 'Le ticket a été annulé')
                                                                    }
                                                                    setOpenMenuId(null)
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                                                            >
                                                                Annuler
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Affichage {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredTickets.length)} sur {filteredTickets.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={cn(
                                    "w-8 h-8 rounded-lg text-sm font-medium",
                                    currentPage === i + 1
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                )}
                            >
                                {i + 1}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="flex gap-1 ml-4">
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                                <Filter className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => {
                                    const csv = "ID,Acheteur,Événement,Catégorie,Statut\n" + 
                                        filteredTickets.map(t => 
                                            `${t.id},"${t.users?.full_name || ''}","${t.events?.title || ''}","${t.zone}","${t.status}"`
                                        ).join("\n")
                                    const blob = new Blob([csv], { type: 'text/csv' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = 'tickets.csv'
                                    a.click()
                                }}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Validated */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Validés</p>
                            <p className="text-4xl font-bold text-gray-900 mt-1">{formatNumber(stats.validated)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-600">+12%</span>
                        <span className="text-sm text-gray-400">vs dernier événement</span>
                    </div>
                    <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.validated / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Outstanding */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">En attente</p>
                            <p className="text-4xl font-bold text-gray-900 mt-1">{formatNumber(stats.pending)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">En attente de paiement</span>
                    </div>
                    <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>

                {/* Cancelled */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Annulés</p>
                            <p className="text-4xl font-bold text-gray-900 mt-1">{formatNumber(stats.cancelled)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Remboursés ou annulés</span>
                    </div>
                    <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                            style={{ width: `${stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
