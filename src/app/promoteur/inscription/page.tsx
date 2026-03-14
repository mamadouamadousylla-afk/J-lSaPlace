"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, ArrowLeft, Loader2, Check, User, Phone, Mail, Globe, FileText, Lock, Eye, EyeOff } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PromoterSignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const [form, setForm] = useState({
        companyName: "",
        contactName: "",
        phone: "",
        password: "",
        email: "",
        description: "",
        website: "",
    })

    const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

    const handleSubmit = async () => {
        if (!form.companyName.trim() || !form.contactName.trim() || !form.phone.trim() || !form.password) {
            setError("Veuillez remplir tous les champs obligatoires")
            return
        }
        if (form.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères")
            return
        }
        setLoading(true)
        setError(null)

        try {
            const formattedPhone = form.phone.startsWith("+") ? form.phone : `+221${form.phone}`
            const nameParts = form.contactName.trim().split(" ")
            const firstName = nameParts[0] || form.contactName
            const lastName = nameParts.slice(1).join(" ") || form.contactName

            // Step 1: Create user account
            const regRes = await fetch('/api/auth/register', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: formattedPhone,
                    firstName,
                    lastName,
                    password: form.password
                })
            })
            const regData = await regRes.json()

            let userId: string | null = null

            if (!regRes.ok) {
                // If account already exists, try to get userId via login
                if (regRes.status === 409) {
                    const loginRes = await fetch('/api/auth/login', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ phone: formattedPhone, password: form.password })
                    })
                    const loginData = await loginRes.json()
                    if (loginRes.ok) {
                        userId = loginData.user?.id || null
                    } else {
                        setError("Ce numéro est déjà utilisé. Vérifiez votre mot de passe.")
                        setLoading(false)
                        return
                    }
                } else {
                    setError(regData.error || "Erreur lors de la création du compte")
                    setLoading(false)
                    return
                }
            } else {
                userId = regData.user?.id || null
            }

            // Step 2: Submit promoter request
            const promoRes = await fetch("/api/promoters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    company_name: form.companyName,
                    contact_name: form.contactName,
                    phone: formattedPhone,
                    email: form.email || null,
                    description: form.description || null,
                    website: form.website || null
                })
            })
            const promoData = await promoRes.json()
            if (!promoRes.ok) {
                setError(promoData.error || "Erreur lors de l'envoi de la demande")
                setLoading(false)
                return
            }

            setSuccess(true)
        } catch {
            setError("Erreur de connexion")
        }
        setLoading(false)
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
                    <p className="text-gray-500 mb-6">
                        Votre demande de compte partenaire est en cours d'examen par l'administrateur. 
                        Vous recevrez une notification une fois approuvée.
                    </p>
                    <Link 
                        href="/promoteur/login"
                        className="inline-flex items-center justify-center gap-2 w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-colors"
                    >
                        Aller à la connexion
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link 
                        href="/mon-compte"
                        className="p-3 bg-white/20 backdrop-blur rounded-xl text-white hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-white">Devenir Partenaire</h1>
                        <p className="text-white/70 text-sm">Créez votre compte organisateur</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-8 space-y-5">
                    {error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Company Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Nom de l'organisation / Événement *
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Ex: Azerty Event"
                                value={form.companyName}
                                onChange={e => set("companyName", e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                            />
                        </div>
                    </div>

                    {/* Contact Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Nom du responsable *
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Prénom et nom"
                                value={form.contactName}
                                onChange={e => set("contactName", e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Téléphone *
                        </label>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <span className="text-lg">🇸🇳</span>
                                <span className="text-sm font-bold text-gray-700">+221</span>
                            </div>
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="tel" 
                                    placeholder="77 000 00 00"
                                    value={form.phone}
                                    onChange={e => set("phone", e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Mot de passe *
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Créez un mot de passe"
                                value={form.password}
                                onChange={e => set("password", e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400">Vous utiliserez ce mot de passe pour accéder à votre espace partenaire</p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Email (optionnel)
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="email" 
                                placeholder="contact@exemple.com"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                            />
                        </div>
                    </div>

                    {/* Website */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Site web (optionnel)
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="url" 
                                placeholder="https://votre-site.com"
                                value={form.website}
                                onChange={e => set("website", e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Description (optionnel)
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                            <textarea 
                                placeholder="Décrivez votre organisation..."
                                rows={3}
                                value={form.description}
                                onChange={e => set("description", e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <p className="text-xs text-yellow-700">
                            <span className="font-bold">ℹ️ Information :</span> Votre demande sera examinée par l'administrateur avant activation. Vous recevrez une réponse sous 24-48h.
                        </p>
                    </div>

                    {/* Submit */}
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" />Envoi...</>
                        ) : (
                            <>Envoyer la demande <ArrowLeft className="w-5 h-5 rotate-180" /></>
                        )}
                    </button>

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-500">
                        Vous avez déjà un compte ?{' '}
                        <Link href="/promoteur/login" className="text-orange-500 font-bold hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
