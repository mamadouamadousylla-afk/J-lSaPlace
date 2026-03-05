"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, CreditCard, Bell, LogOut, ChevronRight, Trophy, Lock, UserPlus, X, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AuthModal from "@/components/shared/AuthModal"

const menuItems = [
    { icon: CreditCard, label: "Historique d'achats", href: "/mon-compte/tickets", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Bell, label: "Notifications", href: "/mon-compte/notifications", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Settings, label: "Paramètres", href: "/mon-compte/parametres", color: "text-gray-500", bg: "bg-gray-50" },
]

interface UserData {
    id: string
    full_name: string
    first_name: string
    last_name: string
    phone: string
    email?: string
    points?: number
    avatar_url?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
    const [showSignupTypeModal, setShowSignupTypeModal] = useState(false)

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = () => {
            const stored = localStorage.getItem("user_session")
            if (stored) {
                try {
                    const userData = JSON.parse(stored)
                    setUser(userData)
                } catch {
                    setUser(null)
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [showAuthModal])

    const handleLogout = () => {
        localStorage.removeItem("user_session")
        setUser(null)
    }

    const openLogin = () => {
        setAuthMode('login')
        setShowAuthModal(true)
    }

    const openSignup = () => {
        setAuthMode('signup')
        setShowAuthModal(true)
    }

    const openSignupType = () => {
        setShowSignupTypeModal(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D75B6]"></div>
            </div>
        )
    }

    // ── NOT LOGGED IN: Show auth options ──
    if (!user) {
        return (
            <>
                <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-[#2D75B6] to-[#1e5a8f] p-6 pt-16 pb-32">
                    {/* Background Pattern */}
                    <div
                        className="fixed inset-0 pointer-events-none opacity-10 z-0"
                        style={{
                            backgroundImage: "url(/fond-lamb.png)",
                            backgroundSize: "300px 300px",
                            backgroundRepeat: "repeat"
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center justify-center min-h-[70vh] space-y-8">
                        {/* Logo/Icon */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center"
                        >
                            <User className="w-12 h-12 text-white" />
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-center space-y-2"
                        >
                            <h1 className="text-3xl font-poppins font-black text-white">
                                Mon Compte
                            </h1>
                            <p className="text-white/70 text-sm">
                                Connectez-vous pour accéder à votre profil
                            </p>
                        </motion.div>

                        {/* Auth Buttons */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-full max-w-sm space-y-4"
                        >
                            {/* Login Button */}
                            <button
                                onClick={openLogin}
                                className="w-full py-4 bg-white text-[#2D75B6] font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform"
                            >
                                <Lock className="w-5 h-5" />
                                Se connecter
                            </button>

                            {/* Signup Button */}
                            <button
                                onClick={openSignupType}
                                className="w-full py-4 bg-white/20 backdrop-blur text-white font-bold rounded-2xl flex items-center justify-center gap-3 border border-white/30 hover:bg-white/30 transition-colors"
                            >
                                <UserPlus className="w-5 h-5" />
                                Créer un compte
                            </button>
                        </motion.div>

                        {/* Features preview */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-sm mt-8"
                        >
                            <p className="text-white/50 text-xs text-center mb-4 uppercase tracking-wider">
                                En vous connectant vous pourrez :
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: CreditCard, label: "Historique" },
                                    { icon: Bell, label: "Notifications" },
                                    { icon: Settings, label: "Paramètres" },
                                ].map((item) => (
                                    <div key={item.label} className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                                        <item.icon className="w-6 h-6 text-white/70 mx-auto mb-2" />
                                        <span className="text-white/70 text-[10px]">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Auth Modal */}
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    mode={authMode}
                    onSuccess={() => {
                        // User will be set by useEffect when localStorage changes
                    }}
                />

                {/* Signup Type Selection Modal */}
                <SignupTypeModal
                    isOpen={showSignupTypeModal}
                    onClose={() => setShowSignupTypeModal(false)}
                    onSelectStandard={() => {
                        setShowSignupTypeModal(false)
                        setAuthMode('signup')
                        setShowAuthModal(true)
                    }}
                    onSelectPromoter={() => {
                        setShowSignupTypeModal(false)
                        // Redirect to promoter signup
                        window.location.href = '/promoteur/login'
                    }}
                />
            </>
        )
    }

    // ── LOGGED IN: Show full profile ──
    return (
        <div className="relative flex flex-col min-h-screen bg-white p-6 pt-16 pb-32 space-y-8">
            {/* Filigrane African Pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                    backgroundImage: "url(/fond-lamb.png)",
                    backgroundSize: "300px 300px",
                    backgroundRepeat: "repeat"
                }}
            />
            <div className="relative z-10 flex flex-col space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-poppins font-black text-[#2D2D2D]">Mon Profil</h1>
                        <span className="text-2xl">😊</span>
                    </div>
                    <button
                        onClick={() => router.push('/mon-compte/parametres')}
                        className="p-3 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-[#2D75B6] hover:scale-110 transition-transform"
                    >
                        <Settings className="w-6 h-6 fill-current" />
                    </button>
                </div>

                {/* User Info Card */}
                <div className="flex flex-col items-center justify-center py-4 space-y-4 relative">
                    <div className="relative w-32 h-32">
                        {/* Background dots */}
                        <div className="absolute top-10 left-4 w-4 h-4 rounded-full bg-blue-300 opacity-60" />
                        <div className="absolute top-1/4 -left-4 w-3 h-3 rounded-full bg-orange-200 opacity-60" />
                        <div className="absolute top-0 right-10 w-4 h-4 rounded-full bg-blue-400 opacity-60" />
                        <div className="absolute bottom-1/4 -right-2 w-4 h-4 rounded-full bg-blue-300 opacity-60" />
                        <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full bg-orange-200 opacity-60" />
                        <div className="absolute top-1/2 -right-8 w-2 h-2 rounded-full bg-blue-400 opacity-60" />

                        {/* Avatar */}
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.full_name}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-[#2D75B6]/20"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2D75B6] to-[#1e5a8f] flex items-center justify-center text-white text-3xl font-bold">
                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-poppins font-bold text-[#2D2D2D]">{user.full_name}</h2>
                        <p className="text-gray-500 text-sm">{user.phone}</p>
                        {user.points !== undefined && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium text-gray-600">{user.points} points</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Sections */}
                <div className="space-y-4">
                    <h3 className="font-poppins font-bold px-2 text-sm text-gray-500 uppercase tracking-widest">Mon Compte</h3>
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-lg text-sm">
                        {menuItems.map((item, idx) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between p-6 transition-colors hover:bg-gray-50",
                                    idx !== menuItems.length - 1 && "border-b border-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", item.bg)}>
                                        <item.icon className={cn("w-5 h-5", item.color)} />
                                    </div>
                                    <span className="font-bold text-gray-900">{item.label}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="pt-4">
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Se déconnecter
                    </button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
                    <p className="text-black font-medium text-[10px] flex items-center gap-1">
                        ©2026 Azerty Agency • Tous droits réservés
                    </p>
                </div>
            </div>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ")
}

// Signup Type Selection Modal Component
interface SignupTypeModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectStandard: () => void
    onSelectPromoter: () => void
}

function SignupTypeModal({ isOpen, onClose, onSelectStandard, onSelectPromoter }: SignupTypeModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: 100, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2D75B6] flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Créer un compte</h2>
                            <p className="text-sm text-gray-500">Choisissez votre type de compte</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Standard Account */}
                    <button
                        onClick={onSelectStandard}
                        className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-[#2D75B6] hover:bg-[#2D75B6]/5 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#2D75B6]/10 flex items-center justify-center group-hover:bg-[#2D75B6]/20 transition-colors">
                                <User className="w-6 h-6 text-[#2D75B6]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Compte Standard</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Pour les spectateurs qui veulent acheter des billets et suivre leurs événements
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">Acheter des billets</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">Historique</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">Points fidélité</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* Promoter Account */}
                    <button
                        onClick={onSelectPromoter}
                        className="w-full p-5 rounded-2xl border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                <Building2 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 text-lg">Compte Promoteur</h3>
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">PRO</span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">
                                    Pour les organisateurs d'événements qui veulent créer et gérer leurs propres événements
                                </p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-2 py-1 bg-orange-100 rounded-lg text-xs text-orange-700">Créer événements</span>
                                    <span className="px-2 py-1 bg-orange-100 rounded-lg text-xs text-orange-700">Statistiques</span>
                                    <span className="px-2 py-1 bg-orange-100 rounded-lg text-xs text-orange-700">Gestion billets</span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0">
                    <p className="text-center text-xs text-gray-400">
                        Vous avez déjà un compte ?{' '}
                        <button onClick={() => { onClose(); }} className="text-[#2D75B6] font-bold hover:underline">
                            Se connecter
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
