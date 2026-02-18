"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Lock } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useState } from "react"

const paymentMethods = [
    { id: "wave", name: "Wave", color: "bg-[#00AEEF]", textColor: "text-white", logo: "https://www.wave.com/static/wave-logo.svg" },
    { id: "orange", name: "Orange Money", color: "bg-[#FF6600]", textColor: "text-white", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg" },
    { id: "free", name: "Free Money", color: "bg-[#ED1C24]", textColor: "text-white", logo: "https://free.sn/sites/default/files/logo_free_money_0.png" },
]

export default function PaymentPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0])
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const qty = parseInt(searchParams.get("qty") || "1")
    const catId = searchParams.get("cat") || "tribune"
    const price = catId === "vip" ? 15000 : catId === "tribune" ? 5000 : 2000
    const total = price * qty

    const handlePayment = () => {
        setIsLoading(true)
        // Simulate payment
        setTimeout(() => {
            setIsLoading(false)
            setIsSuccess(true)
            setTimeout(() => {
                router.push("/mon-compte/tickets")
            }, 3000)
        }, 2000)
    }

    return (
        <div className="flex flex-col min-h-screen p-6 pt-16 space-y-8 bg-gray-50 dark:bg-black">
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 rounded-full bg-white dark:bg-gray-900 shadow-sm">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-poppins font-bold">Paiement Sécurisé</h1>
            </div>

            {/* Recap */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Récapitulatif</p>
                        <h2 className="font-bold text-lg">Modou Lô vs Siteu</h2>
                        <p className="text-sm text-gray-500">{qty}x Ticket {catId.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-poppins font-bold text-2xl text-primary">{formatPrice(total)}</p>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-4">
                <h3 className="font-poppins font-bold px-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-primary" />
                    Mode de paiement
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {paymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => setSelectedMethod(method)}
                            className={cn(
                                "flex items-center justify-between p-5 rounded-[2rem] transition-all border-2",
                                selectedMethod.id === method.id
                                    ? "border-primary bg-primary/5"
                                    : "border-white dark:border-gray-900 bg-white dark:bg-gray-900"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden p-1 bg-white", method.id === 'wave' && 'bg-blue-50')}>
                                    <div className={cn("w-full h-full rounded-xl flex items-center justify-center font-bold text-xs", method.color, method.textColor)}>
                                        {method.name[0]}
                                    </div>
                                </div>
                                <span className="font-bold">{method.name}</span>
                            </div>
                            {selectedMethod.id === method.id && (
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
                <h3 className="font-poppins font-bold px-2">Vos informations</h3>
                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Nom complet"
                        className="w-full px-6 py-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex gap-2">
                        <div className="w-20 px-4 py-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center font-bold text-gray-400">
                            +221
                        </div>
                        <input
                            type="tel"
                            placeholder="Téléphone"
                            className="flex-1 px-6 py-4 rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            {/* Security Disclaimer */}
            <div className="flex items-center gap-2 justify-center text-gray-400 text-xs">
                <Lock className="w-3 h-3" />
                Paiement crypté et 100% sécurisé
            </div>

            {/* Action Button */}
            <div className="pt-4">
                <button
                    onClick={handlePayment}
                    disabled={isLoading || isSuccess}
                    className={cn(
                        "button-gnudem w-full py-5 text-xl font-bold transition-all flex items-center justify-center gap-3",
                        isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-primary text-white shadow-primary/20"
                    )}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isSuccess ? (
                        "Succès !"
                    ) : (
                        `Payer ${formatPrice(total)}`
                    )}
                </button>
            </div>

            {/* Success Modal Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-primary flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className="w-32 h-32 rounded-full bg-white flex items-center justify-center mb-8"
                        >
                            <CheckCircle2 className="w-20 h-20 text-primary" />
                        </motion.div>
                        <h2 className="text-4xl font-poppins font-bold text-white mb-4">Waaw ! Jërejëf !</h2>
                        <p className="text-white/80 text-lg mb-8">Votre paiement a été validé. Redirection vers vos tickets...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
