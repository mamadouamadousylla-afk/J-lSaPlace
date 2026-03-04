"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, Eye, EyeOff, Shield, ArrowRight, Info } from "lucide-react"

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (email === "admin@sunulamb.com" && password === "admin123") {
            localStorage.setItem("admin_auth", "true")
            localStorage.setItem("admin_email", email)
            router.push("/admin")
        } else {
            setError("Email ou mot de passe incorrect")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── LEFT PANEL ── */}
            <div
                className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0d3d1f 0%, #1a5c30 40%, #2d8a50 100%)"
                }}
            >
                {/* Background image overlay */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url('/hero-combat.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                    }}
                />
                {/* Green radial glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/40" />

                {/* Top — shield icon */}
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                </div>

                {/* Center — headline */}
                <div className="relative z-10 space-y-6">
                    <h1 className="text-5xl font-black text-white leading-tight">
                        Gérez vos événements<br />avec excellence.
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed max-w-md">
                        Accédez à votre tableau de bord JelSa Place pour superviser
                        vos réservations, gérer vos participants et optimiser votre
                        organisation en temps réel.
                    </p>

                    {/* Social proof */}
                    <div className="flex items-center gap-4 pt-4">
                        <div className="flex -space-x-3">
                            {["/modou-lo.png", "/sa-thies.png", "/eumeu-ada.jpg"].map((src, i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden bg-white/20"
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-white/80 text-sm font-medium">
                            +500 gestionnaires nous font confiance
                        </p>
                    </div>
                </div>

                {/* Bottom — copyright */}
                <div className="relative z-10">
                    <p className="text-white/40 text-sm">
                        © 2025 JelSa Place. Propulsion par l&apos;innovation.
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 flex items-center justify-center bg-white px-8 py-12">
                <div className="w-full max-w-[420px] space-y-8">

                    {/* Logo */}
                    <div>
                        <div className="w-16 h-16 rounded-2xl bg-[#1A8744] flex items-center justify-center mb-6">
                            <img
                                src="/logo jel sa passe.png"
                                alt="JelSa Place"
                                className="w-12 h-12 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">
                            Connexion sécurisée
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            Administration du portail JelSa Place
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-800">
                                Email professionnel
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@jelsaplace.com"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1A8744] focus:ring-2 focus:ring-[#1A8744]/20 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-800">
                                    Mot de passe
                                </label>
                                <button type="button" className="text-sm text-[#1A8744] font-semibold hover:underline">
                                    Oublié ?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1A8744] focus:ring-2 focus:ring-[#1A8744]/20 outline-none transition-all text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    rememberMe ? "border-[#1A8744] bg-[#1A8744]" : "border-gray-300"
                                }`}
                            >
                                {rememberMe && <div className="w-2 h-2 rounded-full bg-white" />}
                            </button>
                            <span className="text-sm text-gray-600">Rester connecté</span>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#1A8744] hover:bg-[#165a34] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#1A8744]/30"
                        >
                            {loading ? "Connexion..." : (
                                <>
                                    Se connecter
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                                Accès de démonstration
                            </p>
                            <p className="text-xs text-amber-800">
                                Email: <strong>admin@sunulamb.com</strong><br />
                                Pass: <strong>admin123</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
