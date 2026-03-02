"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
    Search, Download, MoreHorizontal, User, Mail, Phone, 
    Calendar, ChevronLeft, ChevronRight, Filter, X,
    UserCheck, UserX, Star
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatNumber, cn } from "@/lib/utils"

interface User {
    id: string
    full_name: string
    phone: string
    email: string
    avatar_url: string
    points: number
    rank: number
    created_at: string
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [showUserModal, setShowUserModal] = useState(false)
    
    const ITEMS_PER_PAGE = 10

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        active: 0
    })

    useEffect(() => {
        loadUsers()

        const channel = supabase
            .channel('users-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
                loadUsers()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    async function loadUsers() {
        setLoading(true)
        
        const { data } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false })

        if (data) {
            setUsers(data)
            const now = new Date()
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            
            setStats({
                total: data.length,
                new: data.filter(u => new Date(u.created_at) > lastWeek).length,
                active: data.filter(u => u.points > 0).length
            })
        }
        setLoading(false)
    }

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch = searchTerm === "" ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeFilter === "all") return matchesSearch
        if (activeFilter === "new") {
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return matchesSearch && new Date(user.created_at) > lastWeek
        }
        if (activeFilter === "active") return matchesSearch && user.points > 0
        
        return matchesSearch
    })

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    // Get initials
    const getInitials = (name: string) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] -m-8 p-8">
            {/* User Detail Modal */}
            {showUserModal && selectedUser && (
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
                                <h2 className="text-xl font-bold">Détails de l'utilisateur</h2>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                    {getInitials(selectedUser.full_name)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedUser.full_name || 'Utilisateur'}
                                    </h3>
                                    <p className="text-gray-500">
                                        Membre depuis {formatDate(selectedUser.created_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="font-medium text-gray-900">{selectedUser.email || 'Non renseigné'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Téléphone</p>
                                        <p className="font-medium text-gray-900">{selectedUser.phone || 'Non renseigné'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Star className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Points</p>
                                        <p className="font-medium text-gray-900">{formatNumber(selectedUser.points || 0)} points</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Date d'inscription</p>
                                        <p className="font-medium text-gray-900">{formatDate(selectedUser.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
                    <p className="text-gray-500 text-sm mt-1">Gérez les comptes utilisateurs</p>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total utilisateurs</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatNumber(stats.total)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Nouveaux (7 jours)</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{formatNumber(stats.new)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Actifs (avec points)</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{formatNumber(stats.active)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Star className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6">
                {[
                    { id: "all", label: "Tous", count: stats.total },
                    { id: "new", label: "Nouveaux", count: stats.new },
                    { id: "active", label: "Actifs", count: stats.active }
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

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        Aucun utilisateur trouvé
                                    </td>
                                </tr>
                            ) : paginatedUsers.map((user, idx) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() => { setSelectedUser(user); setShowUserModal(true) }}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {getInitials(user.full_name)}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-900 block">{user.full_name || 'Utilisateur'}</span>
                                                <span className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3 h-3" />
                                                {user.phone || 'Non renseigné'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Mail className="w-3 h-3" />
                                                {user.email || 'Non renseigné'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-500" />
                                            <span className="font-bold text-gray-900">{formatNumber(user.points || 0)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Affichage {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length}
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
                                    const csv = "ID,Nom,Téléphone,Email,Points,Date\n" + 
                                        filteredUsers.map(u => 
                                            `${u.id},"${u.full_name || ''}","${u.phone || ''}","${u.email || ''}",${u.points || 0},"${formatDate(u.created_at)}"`
                                        ).join("\n")
                                    const blob = new Blob([csv], { type: 'text/csv' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = 'utilisateurs.csv'
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
        </div>
    )
}
