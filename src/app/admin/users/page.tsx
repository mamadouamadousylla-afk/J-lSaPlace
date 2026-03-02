"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, User, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadUsers() {
            const { data } = await supabase
                .from("users")
                .select("*")
                .order("created_at", { ascending: false })

            if (data) setUsers(data)
            setLoading(false)
        }
        loadUsers()

        // Realtime subscription
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

    return (
        <div className="space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-poppins font-bold text-gray-900">Utilisateurs</h1>
                <p className="text-gray-500 mt-1 text-sm">Gérez les comptes clients et leurs points de fidélité.</p>
            </header>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-2 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou numéro..."
                        className="w-full pl-12 pr-4 py-3 bg-transparent rounded-xl focus:outline-none text-sm"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 font-medium">Utilisateur</th>
                                <th className="px-6 py-6 font-medium">Contact</th>
                                <th className="px-6 py-6 font-medium">Points</th>
                                <th className="px-6 py-6 font-medium">Date d'inscription</th>
                                <th className="px-8 py-6 text-right font-medium">Rôle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
                                        Chargement des utilisateurs...
                                    </td>
                                </tr>
                            ) : users.map((user, idx) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="font-bold text-gray-900">{user.full_name || 'Anonyme'}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="font-mono text-xs font-bold text-gray-600">{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="font-bold text-[#1A8744] bg-[#D1F7C4] px-3 py-1.5 rounded-full text-[10px] tracking-widest uppercase">
                                            {user.points || 0} pts
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 text-sm font-medium">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-[#D1F7C4] text-[#1A8744]' : 'bg-gray-100 text-gray-600'}`}>
                                            {user.role === 'admin' ? 'Admin' : 'Client'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
