"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Trash2, Ticket, CreditCard, Calendar, User, Settings, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
    id: string
    type: "ticket_purchased" | "payment_received" | "event_created" | "user_registered" | "system"
    title: string
    message: string
    data: any
    is_read: boolean
    created_at: string
}

const typeIcons = {
    ticket_purchased: Ticket,
    payment_received: CreditCard,
    event_created: Calendar,
    user_registered: User,
    system: Settings
}

const typeColors = {
    ticket_purchased: "bg-blue-100 text-blue-600",
    payment_received: "bg-green-100 text-green-600",
    event_created: "bg-purple-100 text-purple-600",
    user_registered: "bg-orange-100 text-orange-600",
    system: "bg-gray-100 text-gray-600"
}

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?limit=20")
            const data = await res.json()
            if (data.success) {
                setNotifications(data.notifications)
                setUnreadCount(data.notifications.filter((n: Notification) => !n.is_read).length)
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
        }
    }

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Mark as read
    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_read: true })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking as read:", error)
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        setLoading(true)
        try {
            await fetch("/api/notifications/mark-all-read", { method: "POST" })
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
        setLoading(false)
    }

    // Delete notification
    const deleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" })
            const deleted = notifications.find(n => n.id === id)
            setNotifications(prev => prev.filter(n => n.id !== id))
            if (deleted && !deleted.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
    }

    // Format relative time
    const formatTime = (date: string) => {
        const now = new Date()
        const notifDate = new Date(date)
        const diff = now.getTime() - notifDate.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "À l'instant"
        if (minutes < 60) return `Il y a ${minutes} min`
        if (hours < 24) return `Il y a ${hours}h`
        if (days < 7) return `Il y a ${days}j`
        return notifDate.toLocaleDateString("fr-FR")
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div>
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <p className="text-xs text-gray-500">
                                    {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Aucune nouvelle notification"}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        disabled={loading}
                                        className="p-2 text-gray-500 hover:text-[#1A8744] hover:bg-green-50 rounded-lg transition-colors"
                                        title="Tout marquer comme lu"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bell className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 text-sm">Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const Icon = typeIcons[notification.type]
                                    return (
                                        <div
                                            key={notification.id}
                                            className={`group flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                                                !notification.is_read ? "bg-blue-50/30" : ""
                                            }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[notification.type]}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm ${!notification.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                                        {notification.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-[10px] text-[#1A8744] font-medium hover:underline"
                                                        >
                                                            Marquer comme lu
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-[10px] text-red-500 font-medium hover:underline flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Supprimer
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unread dot */}
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-[#1A8744] rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false)
                                        window.location.href = "/admin/notifications"
                                    }}
                                    className="text-sm text-[#1A8744] font-medium hover:underline"
                                >
                                    Voir toutes les notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
