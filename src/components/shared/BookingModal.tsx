"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Minus, Plus, ArrowRight, Smartphone, CheckCircle2 } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

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
    }
}

const paymentMethods = [
    { id: "wave", name: "Wave", logo: "/wave-logo.png" },
    { id: "orange", name: "Orange Money", logo: "/om-logo.png" },
    { id: "free", name: "Free Money", logo: "/free-logo.png" },
]

export default function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
    const router = useRouter()
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [whatsapp, setWhatsapp] = useState("")
    const [vipQty, setVipQty] = useState(1)
    const [standardQty, setStandardQty] = useState(0)
    const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id)

    const vipPrice = 50000
    const standardPrice = 10000
    const total = (vipQty * vipPrice) + (standardQty * standardPrice)

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
                            <div className="flex items-center gap-2.5 text-[#1A2D42]">
                                <User className="w-5 h-5 text-[#2D75B6]" />
                                <h3 className="font-bold text-lg">Vos informations</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">PRÉNOM</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Moussa"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">NOM</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Diop"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-[#8E9AAF] uppercase tracking-widest ml-1">NUMÉRO WHATSAPP</label>
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
                                        className="flex-1 px-6 py-4 rounded-[1.25rem] bg-[#F8F9FA] border-none focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 placeholder:text-gray-300 transition-all font-medium tracking-wide text-sm"
                                    />
                                </div>
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

                            <div className="space-y-4">
                                {/* VIP */}
                                <div className="flex items-center justify-between p-5 bg-[#F8FBFE] rounded-[2rem] border border-blue-50/30">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-gray-900 text-lg">VIP</p>
                                        <p className="text-[#2D75B6] font-bold tracking-tight">{formatPrice(vipPrice)}</p>
                                    </div>
                                    <div className="flex items-center gap-5 bg-white rounded-full p-1.5 shadow-sm border border-gray-100/50">
                                        <button
                                            onClick={() => setVipQty(Math.max(0, vipQty - 1))}
                                            className={cn(
                                                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                                                vipQty > 0 ? "text-gray-400 hover:bg-gray-50" : "text-gray-200"
                                            )}
                                        >
                                            <Minus className="w-6 h-6" />
                                        </button>
                                        <span className="w-4 text-center font-bold text-gray-900 text-lg">{vipQty}</span>
                                        <button
                                            onClick={() => setVipQty(vipQty + 1)}
                                            className="w-11 h-11 rounded-full bg-[#2D75B6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-90 transition-transform"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Standard */}
                                <div className="flex items-center justify-between p-5 bg-[#F8F9FA] rounded-[2rem] border border-gray-50">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-gray-900 text-lg">Standard</p>
                                        <p className="text-[#2D75B6] font-bold tracking-tight">{formatPrice(standardPrice)}</p>
                                    </div>
                                    <div className="flex items-center gap-5 bg-white rounded-full p-1.5 shadow-sm border border-gray-100/50">
                                        <button
                                            onClick={() => setStandardQty(Math.max(0, standardQty - 1))}
                                            className={cn(
                                                "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                                                standardQty > 0 ? "text-gray-400 hover:bg-gray-50" : "text-gray-200"
                                            )}
                                        >
                                            <Minus className="w-6 h-6" />
                                        </button>
                                        <span className="w-4 text-center font-bold text-gray-900 text-lg">{standardQty}</span>
                                        <button
                                            onClick={() => setStandardQty(standardQty + 1)}
                                            className={cn(
                                                "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
                                                standardQty > 0 ? "bg-[#2D75B6] text-white shadow-lg" : "bg-gray-100 text-gray-400"
                                            )}
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="space-y-5 pt-2">
                            <div className="flex items-center gap-2.5 text-[#1A2D42]">
                                <Smartphone className="w-5 h-5 text-[#2D75B6]" />
                                <h3 className="font-bold text-lg">Mode de paiement</h3>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-4 rounded-[2.5rem] transition-all border-2",
                                            selectedPayment === method.id
                                                ? "border-[#2D8F5E] bg-[#F0F9F4]"
                                                : "border-gray-100 bg-white"
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
                                disabled={total === 0 || !firstName || !lastName || !whatsapp}
                                className={cn(
                                    "w-full py-5 rounded-[1.5rem] font-bold text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                                    (total === 0 || !firstName || !lastName || !whatsapp)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-[#2D75B6] text-white shadow-xl shadow-[#2D75B6]/25"
                                )}
                                onClick={() => {
                                    // Simulate payment flow
                                    router.push(`/mon-compte/tickets?id=${event.id}&qty=${vipQty + standardQty}&cat=${vipQty > 0 ? 'vip' : 'standard'}`)
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
            </div>
        </AnimatePresence>
    )
}
