"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Phone, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react"

export default function PromoterLoginPage() {
    const router = useRouter()
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async () => {
        if (!phone || !password) {
            setError("Veuillez remplir tous les champs")
            return
        }
        setLoading(true)
        setError(null)

        try {
            // Call server-side API for promoter login
            const res = await fetch("/api/auth/promoter-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, password })
            })
            const data = await res.json()

            if (!res.ok) {
                if (data.error === "not_partner") {
                    // Regular user, redirect to standard account
                    localStorage.setItem("user_session", JSON.stringify(data.user))
                    router.push("/mon-compte")
                    return
                }
                setError(data.message || data.error || "Identifiants incorrects")
                setLoading(false)
                return
            }

            // Success - save promoter session
            localStorage.setItem("promoter_session", JSON.stringify({
                ...data.promoter,
                user: data.user
            }))
            router.push("/promoteur")
        } catch (err) {
            console.error("[LOGIN] Error:", err)
            setError("Erreur de connexion")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: "url(/fond-lamb.png)", backgroundSize: "300px", backgroundRepeat: "repeat" }} />

            <div className="w-full max-w-md relative z-10">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Espace Partenaire</h1>
                        <p className="text-white/70 text-sm mt-1">Connectez-vous à votre espace</p>
                    </div>

                    {/* Form */}
                    <div className="p-8 space-y-5">
                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Numéro de téléphone</label>
                            <div className="flex gap-2">
                                <div className="px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2 font-bold text-gray-900 text-sm">
                                    <div className="w-5 h-3 rounded-sm overflow-hidden flex">
                                        <div className="w-1/3 bg-[#00853F]" />
                                        <div className="w-1/3 bg-[#FDEF42]" />
                                        <div className="w-1/3 bg-[#E31B23]" />
                                    </div>
                                    +221
                                </div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="tel" placeholder="77 000 00 00" value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm font-medium tracking-wide"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type={showPassword ? "text" : "password"} placeholder="Mot de passe" value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <button onClick={handleLogin} disabled={loading || !phone || !password}
                            className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                loading || !phone || !password
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                            }`}>
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Connexion...</> : <>Se connecter <ArrowRight className="w-5 h-5" /></>}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                            Pas encore partenaire ?{" "}
                            <a href="/promoteur/inscription" className="text-orange-500 font-bold hover:underline">Créer une demande</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
