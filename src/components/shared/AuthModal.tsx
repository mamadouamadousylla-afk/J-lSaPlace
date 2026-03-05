"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Phone, Lock, User, ArrowRight, Loader2, Eye, EyeOff, Building2, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    mode?: 'login' | 'signup'
    onSuccess?: () => void
}

type SignupType = 'user' | 'promoter'

export default function AuthModal({ isOpen, onClose, mode: initialMode = 'login', onSuccess }: AuthModalProps) {
    const { sendOTP, verifyOTP } = useAuth()
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
    const [step, setStep] = useState<'phone' | 'otp' | 'signup-type' | 'promoter-form'>('phone')
    const [signupType, setSignupType] = useState<SignupType>('user')
    
    // Form fields - user
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [phone, setPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    
    // Form fields - promoter
    const [companyName, setCompanyName] = useState("")
    const [contactName, setContactName] = useState("")
    const [promoPhone, setPromoPhone] = useState("")
    const [promoEmail, setPromoEmail] = useState("")
    const [promoDesc, setPromoDesc] = useState("")
    const [promoWebsite, setPromoWebsite] = useState("")
    
    // UI states
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [promoterSuccess, setPromoterSuccess] = useState(false)

    const handleSendOTP = async () => {
        if (!phone || phone.length < 9) {
            setError("Numéro de téléphone invalide")
            return
        }

        // ── LOGIN: verify phone + password directly, no OTP ──
        if (mode === 'login') {
            if (!password) {
                setError("Mot de passe requis")
                return
            }
            setLoading(true)
            setError(null)
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: `+221${phone}`, password })
                })
                const data = await res.json()
                if (!res.ok) {
                    setError(data.error || "Identifiants incorrects")
                    setLoading(false)
                    return
                }
                if (typeof window !== "undefined") {
                    localStorage.setItem("user_session", JSON.stringify(data.user))
                }
                onSuccess?.()
                onClose()
                setPhone(""); setPassword(""); setStep('phone')
            } catch {
                setError("Erreur de connexion")
            }
            setLoading(false)
            return
        }

        // ── SIGNUP: create account directly, no OTP ──
        if (!firstName.trim() || !lastName.trim()) {
            setError("Veuillez remplir tous les champs")
            return
        }
        if (!password || password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/auth/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: `+221${phone}`, firstName, lastName, password })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || "Erreur lors de la création du compte")
                setLoading(false)
                return
            }
            // Save session and close
            if (typeof window !== "undefined") {
                localStorage.setItem("user_session", JSON.stringify(data.user))
            }
            onSuccess?.()
            onClose()
            setPhone(""); setPassword(""); setFirstName(""); setLastName(""); setStep('phone')
        } catch {
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
                    lastName: mode === 'signup' ? lastName : undefined,
                    password: mode === 'signup' ? password : undefined
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
        setCompanyName("")
        setContactName("")
        setPromoPhone("")
        setPromoEmail("")
        setPromoDesc("")
        setPromoWebsite("")
        setPromoterSuccess(false)
        setError(null)
        onClose()
    }

    const handlePromoterSubmit = async () => {
        if (!companyName.trim() || !contactName.trim() || !promoPhone.trim()) {
            setError("Veuillez remplir les champs obligatoires")
            return
        }
        setLoading(true)
        setError(null)
        try {
            const stored = localStorage.getItem("user_session")
            const user = stored ? JSON.parse(stored) : null
            const res = await fetch("/api/promoters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    company_name: companyName,
                    contact_name: contactName,
                    phone: promoPhone.startsWith("+") ? promoPhone : `+221${promoPhone}`,
                    email: promoEmail || null,
                    description: promoDesc || null,
                    website: promoWebsite || null
                })
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || "Erreur lors de l'envoi")
            } else {
                setPromoterSuccess(true)
            }
        } catch {
            setError("Erreur de connexion")
        }
        setLoading(false)
    }

    // Password strength indicator
    const getPasswordStrength = () => {
        if (!password) return { width: '0%', color: 'bg-gray-200' }
        if (password.length < 6) return { width: '25%', color: 'bg-red-500' }
        if (password.length < 8) return { width: '50%', color: 'bg-yellow-500' }
        if (password.length < 10) return { width: '75%', color: 'bg-blue-500' }
        return { width: '100%', color: 'bg-green-500' }
    }
    
    const passwordStrength = getPasswordStrength()

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
                            {(step === 'promoter-form' || step === 'signup-type') && (
                                <button
                                    onClick={() => {
                                        if (step === 'promoter-form') setStep('signup-type')
                                        else { setStep('phone'); setMode('login') }
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-1"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                step === 'promoter-form' ? "bg-orange-500" : "bg-[#2D75B6]"
                            )}>
                                {step === 'promoter-form' ? <Building2 className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {mode === 'login' ? 'Connexion' 
                                    : step === 'signup-type' ? 'Choisir un type de compte'
                                    : step === 'promoter-form' ? 'Compte Promoteur'
                                    : 'Créer un compte'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {mode === 'login' ? 'Connectez-vous pour continuer'
                                    : step === 'signup-type' ? 'Sélectionnez votre type de compte'
                                    : step === 'promoter-form' ? 'Demande de compte promoteur'
                                    : 'Inscrivez-vous pour continuer'}
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
                        {/* ── SIGNUP TYPE SELECTION ── */}
                        {step === 'signup-type' ? (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 text-center">Quel type de compte souhaitez-vous créer ?</p>
                                {/* User Account */}
                                <button
                                    onClick={() => { setSignupType('user'); setStep('phone') }}
                                    className="w-full p-5 border-2 border-gray-200 rounded-2xl flex items-center gap-4 hover:border-[#2D75B6] hover:bg-blue-50 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#2D75B6]/10 flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-[#2D75B6]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Compte Standard</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Achetez des billets et suivez vos événements</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto" />
                                </button>

                                {/* Promoter Account */}
                                <button
                                    onClick={() => { setSignupType('promoter'); setStep('promoter-form') }}
                                    className="w-full p-5 border-2 border-gray-200 rounded-2xl flex items-center gap-4 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Compte Promoteur</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Créez et gérez vos événements de lutte</p>
                                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold">
                                            Approbation admin requise
                                        </span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 ml-auto" />
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Déjà un compte ?{' '}
                                    <button onClick={() => { setMode('login'); setStep('phone') }} className="text-[#2D75B6] font-bold hover:underline">Se connecter</button>
                                </p>
                            </div>

                        ) : step === 'promoter-form' ? (
                            // ── PROMOTER FORM ──
                            promoterSuccess ? (
                                <div className="text-center space-y-4 py-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Demande envoyée !</h3>
                                    <p className="text-sm text-gray-500">
                                        Votre demande de compte promoteur est en cours d'examen par l'administrateur. Vous serez notifié une fois approuvé.
                                    </p>
                                    <button onClick={handleClose} className="px-6 py-3 bg-[#2D75B6] text-white font-bold rounded-xl">
                                        Fermer
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Company Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nom de l'organisation / Événement *</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" placeholder="Ex: Combat Arena Dakar" value={companyName} onChange={e => setCompanyName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm" />
                                        </div>
                                    </div>

                                    {/* Contact Name */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nom du responsable *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" placeholder="Prénom et Nom" value={contactName} onChange={e => setContactName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm" />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Téléphone *</label>
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
                                                <input type="tel" placeholder="77 000 00 00" value={promoPhone} onChange={e => setPromoPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm font-medium tracking-wide" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email (optionnel)</label>
                                        <input type="email" placeholder="contact@exemple.com" value={promoEmail} onChange={e => setPromoEmail(e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm" />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Description (optionnel)</label>
                                        <textarea placeholder="Décrivez votre activité de promotion..." value={promoDesc} onChange={e => setPromoDesc(e.target.value)} rows={3}
                                            className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm resize-none" />
                                    </div>

                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                            <p className="text-sm text-red-600">{error}</p>
                                        </div>
                                    )}

                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                                        <p className="text-xs text-yellow-700">
                                            ⚠️ Votre demande sera examinée par l'administrateur avant activation. Vous recevrez une réponse sous 24-48h.
                                        </p>
                                    </div>

                                    <button onClick={handlePromoterSubmit} disabled={loading || !companyName || !contactName || !promoPhone}
                                        className={cn("w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                            loading || !companyName || !contactName || !promoPhone
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-orange-500 text-white shadow-lg shadow-orange-500/20")}>
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Envoi...</> : <>Envoyer la demande <ArrowRight className="w-5 h-5" /></>}
                                    </button>
                                </div>
                            )

                        ) : step === 'phone' ? (
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

                                {/* Password field for signup */}
                                {mode === 'signup' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Créez un mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {/* Password strength indicator */}
                                        {password && (
                                            <div className="space-y-1">
                                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                                        style={{ width: passwordStrength.width }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-gray-500">
                                                    Minimum 6 caractères
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Password field (login only) */}
                                {mode === 'login' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                            Mot de passe
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#2D75B6] focus:ring-2 focus:ring-[#2D75B6]/20 text-gray-900 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
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
                                    disabled={loading || !phone || (mode === 'signup' && (!agreeTerms || !password))}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all",
                                        loading || !phone || (mode === 'signup' && (!agreeTerms || !password))
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-[#2D75B6] text-white shadow-lg shadow-blue-500/20"
                                    )}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {mode === 'signup' ? "Création du compte..." : "Connexion..."}
                                        </>
                                    ) : (
                                        <>
                                            {mode === 'signup' ? "Créer mon compte" : "Se connecter"}
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
                                                onClick={() => { setMode('signup'); setStep('signup-type') }}
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
