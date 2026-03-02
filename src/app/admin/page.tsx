"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Users,
    Calendar,
    Ticket,
    Banknote,
    Search,
    Bell
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"

export default function AdminOverview() {
    const [stats, setStats] = useState({
        users: 0,
        events: 0,
        tickets: 0,
        revenue: 0
    })
    const [recentTickets, setRecentTickets] = useState<any[]>([])
    const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly')
    const [notifications, setNotifications] = useState(3)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const bellRef = useRef<HTMLButtonElement>(null)
    const notificationsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadStats() {
            const { count: usersCount } = await supabase.from("users").select("*", { count: 'exact', head: true })
            const { count: eventsCount } = await supabase.from("events").select("*", { count: 'exact', head: true })
            const { data: tickets } = await supabase.from("tickets").select("total_price, created_at")

            const { data: recent } = await supabase
                .from("tickets")
                .select("id, total_price, status, created_at, users(full_name), events(title)")
                .order("created_at", { ascending: false })
                .limit(5)

            const totalRevenue = tickets?.reduce((sum, t) => sum + (t.total_price || 0), 0) || 0

            setStats({
                users: usersCount || 0,
                events: eventsCount || 0,
                tickets: tickets?.length || 0,
                revenue: totalRevenue
            })
            if (recent) setRecentTickets(recent)
        }
        loadStats()

        // Realtime subscriptions for live dashboard
        const channel = supabase
            .channel('dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => loadStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => loadStats())
            .subscribe()

        // Close notifications dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (showNotifications && bellRef.current && !bellRef.current.contains(event.target as Node) && 
                notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            supabase.removeChannel(channel)
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showNotifications, bellRef, notificationsRef])

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
        return num.toString()
    }

    const statCards = [
        {
            label: "Utilisateurs",
            value: formatNumber(stats.users),
            icon: Users,
            trend: "+12%",
            positive: true,
            iconColor: "text-green-600",
            iconBg: "bg-green-50"
        },
        {
            label: "Événements",
            value: formatNumber(stats.events),
            icon: Calendar,
            trend: "+5%",
            positive: true,
            iconColor: "text-blue-600",
            iconBg: "bg-blue-50"
        },
        {
            label: "Billets Vendus",
            value: formatNumber(stats.tickets),
            icon: Ticket,
            trend: "+18%",
            positive: true,
            iconColor: "text-purple-600",
            iconBg: "bg-purple-50"
        },
        {
            label: "Revenus (FCFA)",
            value: formatNumber(stats.revenue),
            icon: Banknote,
            trend: "-2%",
            positive: false,
            iconColor: "text-orange-600",
            iconBg: "bg-orange-50"
        }
    ]

    return (
        <div className="space-y-6">
            {/* Topbar */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-poppins font-bold text-gray-900">Vue d'ensemble</h1>
                    <p className="text-gray-500 mt-1 text-sm">Bonjour, Admin</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border-none shadow-sm pl-11 pr-4 py-3 rounded-full w-64 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A8744]/20"
                        />
                    </div>
                    <button 
                        ref={bellRef}
                        className="relative p-3 bg-white shadow-sm rounded-full text-gray-600 hover:text-gray-900 transition-colors bell-button"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className="w-5 h-5" />
                        {notifications > 0 && (
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </button>
                    <div className="flex items-center gap-3 ml-2">
                        <div className="w-10 h-10 rounded-full bg-[#1A8744]/20 flex items-center justify-center text-[#1A8744] font-bold text-sm">
                            AM
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">Alex Morgan</p>
                            <p className="text-xs text-gray-500">Super Admin</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div ref={notificationsRef} className="absolute right-6 top-24 bg-white rounded-2xl shadow-lg border border-gray-100 w-80 z-10 notifications-dropdown">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-[#1A8744] mt-2"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Nouveau billet vendu</p>
                                <p className="text-xs text-gray-500">Il y a 2 minutes</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Paiement en attente</p>
                                <p className="text-xs text-gray-500">Il y a 1 heure</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Nouvel utilisateur</p>
                                <p className="text-xs text-gray-500">Hier</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-100 text-center">
                        <button 
                            className="text-sm font-bold text-[#1A8744]"
                            onClick={() => setNotifications(0)}
                        >
                            Marquer comme lu
                        </button>
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.iconBg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                            {/* Mock Bar Chart Sparkline */}
                            <div className="flex items-end gap-1 h-8 opacity-50">
                                <div className={`w-1.5 h-[40%] rounded-full ${stat.iconBg.replace('50', '300')}`}></div>
                                <div className={`w-1.5 h-[60%] rounded-full ${stat.iconBg.replace('50', '300')}`}></div>
                                <div className={`w-1.5 h-[80%] rounded-full ${stat.iconColor.replace('text-', 'bg-')}`}></div>
                                <div className={`w-1.5 h-[100%] rounded-full ${stat.iconColor.replace('text-', 'bg-')}`}></div>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-3xl font-poppins font-semibold text-gray-900">
                                {stat.value}
                            </h3>
                            <span className={`text-xs font-bold ${stat.positive ? "text-green-500" : "text-red-500"}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Line Chart Mock */}
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] lg:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-lg font-poppins font-semibold text-gray-900">Tendance Revenus & Ventes</h2>
                        <div className="flex bg-gray-50 rounded-full p-1">
                            <button 
                                className={`px-4 py-1.5 text-xs font-bold rounded-full text-gray-900 transition-colors ${timeRange === 'weekly' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                onClick={() => setTimeRange('weekly')}
                            >
                                Hebdomadaire
                            </button>
                            <button 
                                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${timeRange === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
                                onClick={() => setTimeRange('monthly')}
                            >
                                Mensuel
                            </button>
                        </div>
                    </div>
                    {/* SVG Line Mock matching the design */}
                    <div className="flex-1 min-h-[200px] relative w-full flex items-end pb-8">
                        <svg className="absolute inset-0 w-full h-[80%]" viewBox="0 0 100 30" preserveAspectRatio="none">
                            {timeRange === 'weekly' ? (
                                // Weekly view - more detailed curve
                                <path d="M0,20 Q10,18 20,22 T40,15 T60,20 T80,5 T100,10 L100,30 L0,30 Z" fill="rgba(26,135,68,0.05)" />
                            ) : (
                                // Monthly view - smoother curve
                                <path d="M0,25 Q25,20 50,18 T100,22 L100,30 L0,30 Z" fill="rgba(26,135,68,0.05)" />
                            )}
                            {timeRange === 'weekly' ? (
                                // Weekly view - more detailed curve
                                <path d="M0,20 Q10,18 20,22 T40,15 T60,20 T80,5 T100,10" fill="none" stroke="#1A8744" strokeWidth="0.5" />
                            ) : (
                                // Monthly view - smoother curve
                                <path d="M0,25 Q25,20 50,18 T100,22" fill="none" stroke="#1A8744" strokeWidth="0.5" />
                            )}
                        </svg>
                        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                            {timeRange === 'weekly' ? (
                                <>
                                    <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                                </>
                            ) : (
                                <>
                                    <span>Jan</span><span>Fév</span><span>Mar</span><span>Avr</span><span>Mai</span><span>Jui</span><span>Jui</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Donut Chart Mock */}
                <div className="bg-white p-8 rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <h2 className="text-lg font-poppins font-semibold text-gray-900 mb-8">Catégories de Billets</h2>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="relative w-32 h-32 mb-8">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" stroke="currentColor" />
                                <path className="text-[#1A8744]" strokeDasharray="70, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="4" stroke="currentColor" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold font-poppins text-gray-900">70%</span>
                            </div>
                        </div>
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-500 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A8744]"></span> Normal
                                </span>
                                <span className="font-bold text-gray-900">70%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2 text-gray-300 font-medium">
                                    <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span> VIP
                                </span>
                                <span className="font-bold text-gray-900">30%</span>
                            </div>
                        </div>
                        <Link href="/admin/tickets" className="mt-8 text-sm font-bold text-[#1A8744] hover:text-green-800 transition-colors block text-center">
                            Voir détails
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Transactions List */}
            <div className="bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-poppins font-semibold text-gray-900">Transactions Récentes</h2>
                    <Link href="/admin/tickets" className="text-sm font-bold text-[#1A8744] hover:text-green-800 transition-colors">Voir tout</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 font-medium">Utilisateur</th>
                                <th className="px-6 py-5 font-medium">Événement</th>
                                <th className="px-6 py-5 font-medium">Montant</th>
                                <th className="px-6 py-5 font-medium">Date</th>
                                <th className="px-6 py-5 font-medium">Méthode</th>
                                <th className="px-8 py-5 text-right font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentTickets.map((ticket, idx) => (
                                <tr key={ticket.id || idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                {(ticket.users?.full_name || 'A')?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-gray-900">{ticket.users?.full_name || 'Awa Sarr'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 font-medium">
                                        {ticket.events?.title || 'Concert de Gala'}
                                    </td>
                                    <td className="px-6 py-5 font-bold text-gray-900">
                                        {ticket.total_price ? formatPrice(ticket.total_price) : '5,000 FCFA'}
                                    </td>
                                    <td className="px-6 py-5 text-gray-500">
                                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 23, 2023'}
                                    </td>
                                    <td className="px-6 py-5 text-gray-500">
                                        Orange Money
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase ${ticket.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-[#D1F7C4] text-[#1A8744]'
                                            }`}>
                                            {ticket.status === 'pending' ? 'EN ATTENTE' : 'SUCCÈS'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {recentTickets.length === 0 && (
                                <>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">JD</div>
                                                <span className="font-semibold text-gray-900">Jean Dupont</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-medium">Grand Combat de Lutte</td>
                                        <td className="px-6 py-5 font-bold text-gray-900">15,000 FCFA</td>
                                        <td className="px-6 py-5 text-gray-500">Oct 24, 2023</td>
                                        <td className="px-6 py-5 text-gray-500">Orange Money</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#D1F7C4] text-[#1A8744]">SUCCÈS</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">AS</div>
                                                <span className="font-semibold text-gray-900">Awa Sarr</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-medium">Concert de Gala</td>
                                        <td className="px-6 py-5 font-bold text-gray-900">5,000 FCFA</td>
                                        <td className="px-6 py-5 text-gray-500">Oct 23, 2023</td>
                                        <td className="px-6 py-5 text-gray-500">Wave</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#FCEFCE] text-[#C4801C]">EN ATTENTE</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">MT</div>
                                                <span className="font-semibold text-gray-900">Moussa Tall</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-500 font-medium">Lamb Championship</td>
                                        <td className="px-6 py-5 font-bold text-gray-900">25,000 FCFA</td>
                                        <td className="px-6 py-5 text-gray-500">Oct 22, 2023</td>
                                        <td className="px-6 py-5 text-gray-500">Transfert Bancaire</td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#D1F7C4] text-[#1A8744]">SUCCÈS</span>
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
