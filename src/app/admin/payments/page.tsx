"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { 
    CreditCard, Search, Download, ArrowUpRight, ArrowDownRight,
    Eye, X, CheckCircle, Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight,
    FileText, AlertCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatPrice, formatNumber, cn } from "@/lib/utils"

interface Payment {
    id: string
    transaction_id: string
    user_name: string
    user_email: string
    event_title: string
    amount: number
    fee: number
    net_amount: number
    payment_method: string
    status: string
    created_at: string
    event_id: string
    phone_number?: string
}

const ITEMS_PER_PAGE = 10

export default function AdminPayments() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterMethod, setFilterMethod] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [showDetails, setShowDetails] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [actionLoading, setActionLoading] = useState(false)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' })

    // Stats
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        totalTransactions: 0,
        totalFees: 0
    })

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type })
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
    }

    useEffect(() => {
        loadPayments()

        // Real-time subscription
        const channel = supabase
            .channel('payments-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
                loadPayments()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadPayments() {
        setLoading(true)
        
        try {
            const { data, error } = await supabase
                .from("payments")
                .select(`
                    id,
                    transaction_id,
                    amount,
                    fee,
                    net_amount,
                    payment_method,
                    status,
                    created_at,
                    event_id,
                    phone_number
                `)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Erreur lors du chargement des paiements:", error)
                setPayments([])
            } else if (data) {
                const formattedPayments: Payment[] = data.map((p: any) => ({
                    id: p.id,
                    transaction_id: p.transaction_id,
                    user_name: "Utilisateur",
                    user_email: "user@example.com",
                    event_title: "Événement",
                    amount: Number(p.amount) || 0,
                    fee: Number(p.fee) || 0,
                    net_amount: Number(p.net_amount) || Number(p.amount) || 0,
                    payment_method: p.payment_method,
                    status: p.status,
                    created_at: p.created_at,
                    event_id: p.event_id,
                    phone_number: p.phone_number
                }))
                setPayments(formattedPayments)

                // Calculate stats
                const totalRevenue = formattedPayments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                const pendingAmount = formattedPayments
                    .filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + p.amount, 0)
                const totalFees = formattedPayments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.fee, 0)
                
                setStats({
                    totalRevenue,
                    pendingAmount,
                    totalTransactions: formattedPayments.length,
                    totalFees
                })
            }
        } catch (err) {
            console.error("Exception:", err)
            setPayments([])
        }
        setLoading(false)
    }

    // Validate a pending payment
    async function validatePayment(payment: Payment) {
        setActionLoading(true)
        try {
            const { error } = await supabase
                .from("payments")
                .update({ status: 'completed' })
                .eq("id", payment.id)

            if (error) {
                showToast("Erreur lors de la validation", "error")
            } else {
                showToast("Paiement validé avec succès!")
                setShowDetails(false)
                loadPayments()
            }
        } catch (err) {
            showToast("Erreur lors de la validation", "error")
        }
        setActionLoading(false)
    }

    // Refund a completed payment
    async function refundPayment(payment: Payment) {
        if (!confirm("Êtes-vous sûr de vouloir rembourser ce paiement?")) return
        
        setActionLoading(true)
        try {
            const { error } = await supabase
                .from("payments")
                .update({ status: 'refunded' })
                .eq("id", payment.id)

            if (error) {
                showToast("Erreur lors du remboursement", "error")
            } else {
                showToast("Paiement remboursé avec succès!")
                setShowDetails(false)
                loadPayments()
            }
        } catch (err) {
            showToast("Erreur lors du remboursement", "error")
        }
        setActionLoading(false)
    }

    // Export to CSV
    function exportToCSV() {
        const headers = ['ID Transaction', 'Montant', 'Frais', 'Net', 'Mode', 'Statut', 'Date']
        const rows = filteredPayments.map(p => [
            p.transaction_id,
            p.amount.toString(),
            p.fee.toString(),
            p.net_amount.toString(),
            p.payment_method,
            p.status,
            new Date(p.created_at).toLocaleDateString('fr-FR')
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        
        showToast("Export CSV téléchargé!")
    }

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = 
            payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.event_title.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesMethod = filterMethod === "all" || payment.payment_method === filterMethod
        const matchesStatus = filterStatus === "all" || payment.status === filterStatus
        
        return matchesSearch && matchesMethod && matchesStatus
    })

    // Pagination
    const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedPayments = filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Status badge component
    const StatusBadge = ({ status }: { status: string }) => {
        const config = {
            completed: { icon: CheckCircle, bg: "bg-green-100", text: "text-green-700", label: "Réussi" },
            pending: { icon: Clock, bg: "bg-yellow-100", text: "text-yellow-700", label: "En attente" },
            failed: { icon: XCircle, bg: "bg-red-100", text: "text-red-700", label: "Échoué" },
            refunded: { icon: RefreshCw, bg: "bg-gray-100", text: "text-gray-700", label: "Remboursé" }
        }
        
        const { icon: Icon, bg, text, label } = config[status as keyof typeof config] || config.pending
        
        return (
            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", bg, text)}>
                <Icon className="w-3.5 h-3.5" />
                {label}
            </span>
        )
    }

    // Method badge
    const MethodBadge = ({ method }: { method: string }) => {
        const config: Record<string, { bg: string; text: string; label: string }> = {
            wave: { bg: "bg-blue-100", text: "text-blue-700", label: "Wave" },
            orange: { bg: "bg-orange-100", text: "text-orange-700", label: "Orange Money" },
            free: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Free Money" },
            card: { bg: "bg-purple-100", text: "text-purple-700", label: "Carte" }
        }
        
        const { bg, text, label } = config[method] || { bg: "bg-gray-100", text: "text-gray-700", label: method }
        
        return (
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", bg, text)}>
                {label}
            </span>
        )
    }

    return (
        <div className="space-y-8">
            {/* Toast Notification */}
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                        "fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2",
                        toast.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
                    )}
                >
                    {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {toast.message}
                </motion.div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-gray-900">Paiements</h1>
                    <p className="text-gray-500 mt-1">Gérez toutes les transactions financières</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={exportToCSV}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Exporter CSV
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <ArrowUpRight className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Revenus Totaux</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">
                        {formatPrice(stats.totalRevenue)}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">En Attente</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">
                        {formatPrice(stats.pendingAmount)}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Transactions</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">
                        {formatNumber(stats.totalTransactions)}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <ArrowDownRight className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Commissions</p>
                    <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">
                        {formatPrice(stats.totalFees)}
                    </p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par ID, utilisateur, événement..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                    <select
                        value={filterMethod}
                        onChange={(e) => {
                            setFilterMethod(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">Tous les modes</option>
                        <option value="wave">Wave</option>
                        <option value="orange">Orange Money</option>
                        <option value="free">Free Money</option>
                        <option value="card">Carte Bancaire</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="completed">Réussi</option>
                        <option value="pending">En attente</option>
                        <option value="failed">Échoué</option>
                        <option value="refunded">Remboursé</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Utilisateur
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Événement
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Montant
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Mode
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </td>
                                </tr>
                            ) : paginatedPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-12 h-12 text-gray-300" />
                                            <p>Aucun paiement trouvé</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 text-sm">
                                                #{payment.transaction_id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{payment.user_name}</p>
                                                <p className="text-gray-500 text-xs">{payment.phone_number || payment.user_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 text-sm">{payment.event_title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">{formatPrice(payment.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <MethodBadge method={payment.payment_method} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 text-sm">
                                                {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedPayment(payment)
                                                        setShowDetails(true)
                                                    }}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredPayments.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredPayments.length)} sur {filteredPayments.length} transactions
                        </p>
                        <div className="flex gap-2 items-center">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    currentPage === 1 ? "bg-gray-50 text-gray-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={cn(
                                            "px-4 py-2 rounded-lg text-sm font-bold transition-colors",
                                            currentPage === pageNum 
                                                ? "bg-primary text-white" 
                                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        )}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                            
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    currentPage === totalPages ? "bg-gray-50 text-gray-300" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showDetails && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowDetails(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
                    >
                        <button
                            onClick={() => setShowDetails(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>

                        <h2 className="text-xl font-poppins font-bold text-gray-900 mb-6">
                            Détails de la Transaction
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">ID Transaction</span>
                                <span className="font-bold text-gray-900">#{selectedPayment.transaction_id.slice(0, 12).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Téléphone</span>
                                <span className="font-bold text-gray-900">{selectedPayment.phone_number || '-'}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Événement</span>
                                <span className="font-bold text-gray-900">{selectedPayment.event_title}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Montant</span>
                                <span className="font-bold text-gray-900">{formatPrice(selectedPayment.amount)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Frais (3%)</span>
                                <span className="font-bold text-gray-900">{formatPrice(selectedPayment.fee)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Net</span>
                                <span className="font-bold text-green-600">{formatPrice(selectedPayment.net_amount)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Mode de paiement</span>
                                <MethodBadge method={selectedPayment.payment_method} />
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-100">
                                <span className="text-gray-500">Statut</span>
                                <StatusBadge status={selectedPayment.status} />
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-gray-500">Date</span>
                                <span className="font-bold text-gray-900">
                                    {new Date(selectedPayment.created_at).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            {selectedPayment.status === 'pending' && (
                                <button 
                                    onClick={() => validatePayment(selectedPayment)}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Valider
                                        </>
                                    )}
                                </button>
                            )}
                            {selectedPayment.status === 'completed' && (
                                <button 
                                    onClick={() => refundPayment(selectedPayment)}
                                    disabled={actionLoading}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <RefreshCw className="w-5 h-5" />
                                            Rembourser
                                        </>
                                    )}
                                </button>
                            )}
                            <button
                                onClick={() => setShowDetails(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
