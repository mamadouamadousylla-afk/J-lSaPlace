"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Minus, Plus, ArrowRight, Smartphone, CheckCircle2, AlertCircle, LogIn } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { usePaymentSettings } from "@/context/SettingsContext"
import { useAuth } from "@/context/AuthContext"
import AuthModal from "./AuthModal"

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    event: {
        id: string
        title: string
        location: string
        date: string
        time: string
        imageUrl: string
        category?: string
        priceVip?: number
        priceTribune?: number
        pricePelouse?: number
    }
}

// Configuration des types de places par catégorie
const CATEGORY_SEAT_TYPES: Record<string, { label: string; key: string; priceKey: string }[]> = {
    SPORT: [
        { label: "VIP", key: "vip", priceKey: "price_vip" },
        { label: "Tribune", key: "tribune", priceKey: "price_tribune" },
        { label: "Pelouse", key: "pelouse", priceKey: "price_pelouse" }
    ],
    MUSIQUE: [
        { label: "VIP Backstage", key: "vip", priceKey: "price_vip" },
        { label: "Tribune Or", key: "tribune", priceKey: "price_tribune" },
        { label: "Fosse Générale", key: "pelouse", priceKey: "price_pelouse" }
    ],
    HUMOUR: [
        { label: "Premium", key: "vip", priceKey: "price_vip" },
        { label: "Standard", key: "tribune", priceKey: "price_tribune" },
        { label: "Étudiant", key: "pelouse", priceKey: "price_pelouse" }
    ],
    LOISIRS: [
        { label: "VIP Prestige", key: "vip", priceKey: "price_vip" },
        { label: "Tribune Privilège", key: "tribune", priceKey: "price_tribune" },
        { label: "Accès Général", key: "pelouse", priceKey: "price_pelouse" }
    ],
    CONFERENCE: [
        { label: "Business Class", key: "vip", priceKey: "price_vip" },
        { label: "Standard", key: "tribune", priceKey: "price_tribune" },
        { label: "Étudiant", key: "pelouse", priceKey: "price_pelouse" }
    ]
}

const allPaymentMethods = [
    { id: "wave", name: "Wave", logo: "/wave-logo.png" },
    { id: "orange", name: "Orange Money", logo: "/om-logo.png" },
    { id: "free", name: "Free Money", logo: "/free-logo.png" },
    { id: "card", name: "Carte Bancaire", logo: "" },
]

export default function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
    const router = useRouter()
    const { payment } = usePaymentSettings()
    const { user, loading: authLoading } = useAuth()
    const [showAuthModal, setShowAuthModal] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [selectedPayment, setSelectedPayment] = useState("") // Aucun mode sélectionné par défaut
    const [showErrors, setShowErrors] = useState(false)
    
    // Quantités de billets dynamiques
    const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({})
    
    // Récupérer les infos complètes de l'événement depuis Supabase
    const [eventData, setEventData] = useState<any>(null)

    // Filtrer les méthodes de paiement selon les paramètres
    const paymentMethods = allPaymentMethods.filter(method => {
        if (method.id === 'wave') return payment.wave_enabled
        if (method.id === 'orange') return payment.orange_enabled
        if (method.id === 'free') return payment.free_enabled
        if (method.id === 'card') return payment.card_enabled
        return true
    })

    useEffect(() => {
        async function loadEventData() {
            if (!event.id) {
                console.error("ID d'événement manquant")
                return
            }
            
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", event.id)
                .single()

            if (error) {
                console.error("Erreur lors du chargement de l'événement:", error.message, error.code, error.details)
                return
            }

            if (data) {
                setEventData(data)
                // Initialiser les quantités à 0
                const seatTypes = CATEGORY_SEAT_TYPES[data.category] || CATEGORY_SEAT_TYPES.SPORT
                const initialQuantities: Record<string, number> = {}
                seatTypes.forEach(type => {
                    initialQuantities[type.key] = 0
                })
                setTicketQuantities(initialQuantities)
            }
        }

        if (isOpen && event.id) {
            loadEventData()
        }
    }, [event.id, isOpen])

    // Réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (isOpen) {
            // Si l'utilisateur est connecté, pré-remplir ses infos
            if (user) {
                setFirstName(user.user_metadata?.first_name || "")
                setLastName(user.user_metadata?.last_name || "")
                setWhatsapp(user.phone?.replace("+221", "") || "")
            } else {
                setFirstName("")
                setLastName("")
                setWhatsapp("")
            }
            setShowErrors(false)
        }
    }, [isOpen, user])

    // Obtenir les types de places pour la catégorie
    const seatTypes = CATEGORY_SEAT_TYPES[eventData?.category] || CATEGORY_SEAT_TYPES.SPORT
    
    // Calculer le total
    const total = seatTypes.reduce((sum, type) => {
        const price = eventData?.[type.priceKey] || 0
        return sum + (ticketQuantities[type.key] || 0) * price
    }, 0)

    // Nombre total de billets
    const totalTickets = Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0)

    // Validation
    const isValid = () => {
        return (
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            whatsapp.trim() !== "" &&
            whatsapp.length >= 9 &&
            totalTickets > 0 &&
            selectedPayment !== ""
        )
    }

    // Mettre à jour la quantité d'un type de billet
    const updateQuantity = (key: string, delta: number) => {
        setTicketQuantities(prev => ({
            ...prev,
            [key]: Math.max(0, (prev[key] || 0) + delta)
        }))
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-lg bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh]"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-2xl font-poppins font-bold text-gray-900">Réserver</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                        {/* Event Card */}
                        <div className="bg-[#F8FBFE] rounded-[2.5rem] p-5 flex gap-5 border border-blue-50/50">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h3 className="font-bold text-gray-900 leading-tight mb-1">{event.title}</h3>
                                <p className="text-[#2D75B6] text-[13px] font-semibold">{event.location}</p>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <div className="w-1 h-1 rounded-full bg-[#A6ADB9]" />
                                    <p className="text-[#A6ADB9] text-[11px] font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                        {event.date} • {event.time}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* User Info Form */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-[#1A2D42]">
                                    <User className="w-5 h-5 text-[#2D75B6]" />
                                    <h3 className="font-bold text-lg">Vos informations</h3>
                                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">(obligatoire)</span>
                                </div>
                                
                                {/* Login option - only show if not logged in */}
                                {!user && (
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#2D75B6]/10 text-[#2D75B6] rounded-full text-sm font-bold hover:bg-[#2D75B6]/20 transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Se connecter
                                    </button>
                                )}
                            </div>

                            {/* Show if logged in */}
                            {user && (
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                            {(user.user_metadata?.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                                            </p>
                                            <p className="text-sm text-gray-500">{user.phone}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">
                                        Connecté
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">
                                        PRÉNOM <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Moussa"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={cn(
                                            "w-full px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-2 focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium text-sm",
                                            showErrors && !firstName.trim() ? "border-red-300" : "border-transparent"
                                        )}
                                    />
                                    {showErrors && !firstName.trim() && (
                                        <p className="text-red-500 text-xs ml-1">Prénom requis</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">
                                        NOM <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Diop"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={cn(
                                            "w-full px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-2 focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium text-sm",
                                            showErrors && !lastName.trim() ? "border-red-300" : "border-transparent"
                                        )}
                                    />
                                    {showErrors && !lastName.trim() && (
                                        <p className="text-red-500 text-xs ml-1">Nom requis</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">
                                    NUMÉRO WHATSAPP <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <div className="px-5 py-4 rounded-[1.25rem] bg-[#F8F9FA] flex items-center gap-2.5 font-bold text-gray-900 border border-gray-50/50">
                                        <div className="w-6 h-4 rounded-sm overflow-hidden flex shadow-sm">
                                            <div className="w-1/3 bg-[#00853F]" />
                                            <div className="w-1/3 bg-[#FDEF42]" />
                                            <div className="w-1/3 bg-[#E31B23]" />
                                        </div>
                                        <span className="text-sm">+221</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="77 000 00 00"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        className={cn(
                                            "flex-1 px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-2 focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium tracking-wide text-sm",
                                            showErrors && whatsapp.length < 9 ? "border-red-300" : "border-transparent"
                                        )}
                                    />
                                </div>
                                {showErrors && whatsapp.length < 9 && (
                                    <p className="text-red-500 text-xs ml-1">Numéro WhatsApp invalide (9 chiffres minimum)</p>
                                )}
                            </div>
                        </div>

                        {/* Ticket Selection */}
                        <div className="space-y-5 pt-2">
                            <div className="flex items-center gap-2.5 text-[#1A2D42]">
                                <div className="w-5 h-5 bg-[#2D75B6] rounded flex flex-col items-center justify-center gap-[3px]">
                                    <div className="w-2.5 h-[1.5px] bg-white rounded-full opacity-60" />
                                    <div className="w-2.5 h-[1.5px] bg-white rounded-full opacity-60" />
                                    <div className="w-2.5 h-[1.5px] bg-white rounded-full opacity-60" />
                                </div>
                                <h3 className="font-bold text-lg">Billets</h3>
                            </div>
                        
                            {/* Message d'erreur si aucun billet sélectionné */}
                            {showErrors && totalTickets === 0 && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Veuillez sélectionner au moins un billet</span>
                                </div>
                            )}
                        
                            <div className="space-y-4">
                                {seatTypes.map((type, index) => {
                                    const price = eventData?.[type.priceKey] || 0
                                    const quantity = ticketQuantities[type.key] || 0
                                    return (
                                        <div 
                                            key={type.key} 
                                            className={cn(
                                                "flex items-center justify-between p-5 rounded-[2rem] border",
                                                index === 0 
                                                    ? "bg-[#F8FBFE] border-blue-50/30" 
                                                    : "bg-[#F8F9FA] border-gray-50"
                                            )}
                                        >
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-gray-900 text-lg">{type.label}</p>
                                                <p className="text-[#2D75B6] font-bold tracking-tight">{formatPrice(price)}</p>
                                            </div>
                                            <div className="flex items-center gap-5 bg-white rounded-full p-1.5 shadow-sm border border-gray-100/50">
                                                <button
                                                    onClick={() => updateQuantity(type.key, -1)}
                                                    className={cn(
                                                        "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                                                        quantity > 0 ? "text-gray-400 hover:bg-gray-50" : "text-gray-200"
                                                    )}
                                                >
                                                    <Minus className="w-6 h-6" />
                                                </button>
                                                <span className="w-4 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(type.key, 1)}
                                                    className={cn(
                                                        "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
                                                        quantity > 0 
                                                            ? "bg-[#2D75B6] text-white shadow-lg shadow-blue-500/20" 
                                                            : "bg-gray-100 text-gray-400"
                                                    )}
                                                >
                                                    <Plus className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="space-y-5 pt-2">
                            <div className="flex items-center gap-2.5 text-[#1A2D42]">
                                <Smartphone className="w-5 h-5 text-[#2D75B6]" />
                                <h3 className="font-bold text-lg">Mode de paiement</h3>
                                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">(obligatoire)</span>
                            </div>

                            {/* Message d'erreur si aucun mode de paiement sélectionné */}
                            {showErrors && !selectedPayment && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Veuillez sélectionner un mode de paiement</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-[2.5rem] transition-all border-2",
                                            selectedPayment === method.id
                                                ? "border-[#2D8F5E] bg-[#F0F9F4]"
                                                : "border-gray-100 bg-white hover:border-gray-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 border border-gray-50">
                                                <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="font-bold text-gray-900 text-lg">{method.name}</span>
                                        </div>
                                        {selectedPayment === method.id && (
                                            <div className="w-7 h-7 rounded-full bg-[#2D8F5E] flex items-center justify-center">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="p-8 pt-6 bg-white border-t border-gray-50/50 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-[#8E9AAF] font-medium text-lg">Total à payer</p>
                            <p className="text-[28px] font-poppins font-bold text-[#1A2D42]">{formatPrice(total)}</p>
                        </div>

                        <div className="space-y-5 pb-4">
                            <button
                                disabled={!isValid()}
                                className={cn(
                                    "w-full py-5 rounded-[1.5rem] font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                                    !isValid()
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[#2D75B6] text-white shadow-xl shadow-[#2D75B6]/25"
                                )}
                                onClick={() => {
                                    if (!isValid()) {
                                        setShowErrors(true)
                                        return
                                    }
                                    // Trouver le type de billet principal
                                    const mainType = Object.entries(ticketQuantities)
                                        .sort(([,a], [,b]) => b - a)[0]
                                    // Simulate payment flow
                                    router.push(`/mon-compte/tickets?id=${event.id}&qty=${totalTickets}&cat=${mainType?.[0] || 'vip'}`)
                                }}
                            >
                                Suivant
                                <ArrowRight className="w-6 h-6" />
                            </button>
                            <p className="text-center text-[11px] text-[#A6ADB9] font-bold uppercase tracking-[0.2em]">
                                PAIEMENT SÉCURISÉ VIA PAYDUNYA
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Auth Modal */}
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => setShowAuthModal(false)}
                />
            </div>
        </AnimatePresence>
    )
}
