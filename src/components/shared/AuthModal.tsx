"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Lock, User, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    mode?: 'login' | 'signup'
    onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, mode: initialMode = 'login', onSuccess }: AuthModalProps) {
    const { sendOTP, verifyOTP } = useAuth()
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    
    // Form fields
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    
    // UI states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [agreeTerms, setAgreeTerms] = useState(false)

    const handleSendOTP = async () => {
        if (!phone || phone.length < 9) {
            setError("Numéro de téléphone invalide")
            return
        }
        
        // For signup, require first and last name
        if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) {
            setError("Veuillez remplir tous les champs")
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const endpoint = '/api/auth/sms-otp'
            const body = 
                { phone: `+221${phone}`, firstName: mode === 'signup' ? firstName : undefined, lastName: mode === 'signup' ? lastName : undefined }
                
            
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                setError(data.error || "Erreur lors de l'envoi")
                setLoading(false)
                return
            }
            
            setStep('otp')
        } catch (err) {
            setError("Erreur de connexion")
        }
        
        setLoading(false)
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            setError("Code OTP invalide")
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch("/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    phone: `+221${phone}`, 
                    token: otp,
                    firstName: mode === 'signup' ? firstName : undefined,
                    lastName: mode === 'signup' ? lastName : undefined
                })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                setError(data.error || "Code invalide")
                setLoading(false)
                return
            }
            
            // Success
            onSuccess?.()
            onClose()
            
            // Reset form
            setPhone("")
            setOtp("")
            setFirstName("")
            setLastName("")
            setPassword("")
            setStep('phone')
        } catch (err) {
            setError("Erreur de vérification")
        }
        
        setLoading(false)
    }

    const handleClose = () => {
        setStep('phone')
        setPhone("")
        setOtp("")
        setFirstName("")
        setLastName("")
        setPassword("")
        setError(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
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
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {mode === 'login' ? 'Connexion' : 'Créer un compte'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {mode === 'login' ? 'Connectez-vous pour continuer' : 'Inscrivez-vous pour continuer'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-5">
                        {step === 'phone' ? (
                            <>
                                {/* Signup fields */}
                                {mode === 'signup' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                Prénom
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Prénom"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                Nom
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Nom"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Phone field */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        Numéro de téléphone
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 font-bold text-gray-900 text-sm">
                                            <div className="w-5 h-3 rounded-sm overflow-hidden flex shadow-sm">
                                                <div className="w-1/3 bg-[#00853F]" />
                                                <div className="w-1/3 bg-[#FDEF42]" />
                                                <div className="w-1/3 bg-[#E31B23]" />
                                            </div>
                                            +221
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="77 000 00 00"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm font-medium tracking-wide"
                                            />
                                        </div>
                                    </div>
                                    {mode === 'signup' && (
                                        <p className="text-xs text-[#2D75B6] font-medium">
                                            Renseignez un numéro WhatsApp
                                        </p>
                                    )}
                                </div>

                                {/* Password field (login only) */}
                                {mode === 'login' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="password"
                                                placeholder="Mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm"
                                            />
                                        </div>
                                        <button className="text-xs text-gray-400 hover:text-[#2D75B6] transition-colors">
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                )}

                                {/* Terms checkbox (signup only) */}
                                {mode === 'signup' && (
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => setAgreeTerms(!agreeTerms)}
                                            className={cn(
                                                "w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                                agreeTerms ? "bg-green-500" : "bg-gray-200"
                                            )}
                                        >
                                            {agreeTerms && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            En créant un compte, j'accepte les <span className="text-[#2D75B6] font-medium">Conditions d'utilisation</span> et la <span className="text-[#2D75B6] font-medium">Politique de confidentialité</span>.
                                        </p>
                                    </div>
                                )}

                                {/* Error message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading || !phone || (mode === 'signup' && !agreeTerms)}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                        loading || !phone || (mode === 'signup' && !agreeTerms)
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-[#2D75B6] text-white shadow-lg shadow-blue-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            Suivant
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                {/* Switch mode */}
                                <p className="text-center text-sm text-gray-500">
                                    {mode === 'login' ? (
                                        <>
                                            Pas de compte ?{' '}
                                            <button
                                                onClick={() => setMode('signup')}
                                                className="text-[#2D75B6] font-bold hover:underline"
                                            >
                                                Créer un compte
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Déjà un compte ?{' '}
                                            <button
                                                onClick={() => setMode('login')}
                                                className="text-[#2D75B6] font-bold hover:underline"
                                            >
                                                Se connecter
                                            </button>
                                        </>
                                    )}
                                </p>
                            </>
                        ) : (
                            <>
                                {/* OTP Step */}
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                                        <Phone className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Vérification</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Entrez le code envoyé au +221 {phone}
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        Code de vérification
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="------"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="w-full px-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-center text-2xl font-bold tracking-[0.5em]"
                                        maxLength={6}
                                    />
                                    {/* Development mode hint */}
                                    <p className="text-xs text-center text-orange-600 bg-orange-50 p-2 rounded-lg">
                                        🔧 Mode test: utilisez le code <strong>123456</strong>
                                    </p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={loading || otp.length < 6}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                        loading || otp.length < 6
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-[#2D75B6] text-white shadow-lg shadow-blue-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            Vérifier
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setStep('phone')}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Modifier le numéro
                                    </button>
                                    <button
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                        className="text-sm text-[#2D75B6] font-medium hover:underline"
                                    >
                                        Renvoyer le code
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
