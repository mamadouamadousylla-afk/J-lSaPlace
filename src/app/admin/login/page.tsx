"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, Mail, Eye, EyeOff, Shield } from "lucide-react"

export default function AdminLogin() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Vérification simple (à remplacer par une vraie authentification)
        // Par défaut: admin@sunulamb.com / admin123
        if (email === "admin@sunulamb.com" && password === "admin123") {
            // Stocker la session dans localStorage
            localStorage.setItem("admin_auth", "true")
            localStorage.setItem("admin_email", email)
            router.push("/admin")
        } else {
            setError("Email ou mot de passe incorrect")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A8744] via-[#1d6f42] to-[#165a34] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white font-poppins">
                        Administration
                    </h1>
                    <p className="text-white/70 mt-2">
                        SunuLamb - Gestion des événements
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                        Connexion sécurisée
                    </h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@sunulamb.com"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1A8744] focus:ring-2 focus:ring-[#1A8744]/20 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#1A8744] focus:ring-2 focus:ring-[#1A8744]/20 outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
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
                            className="w-full py-4 bg-[#1A8744] hover:bg-[#165a34] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>

                    {/* Default credentials hint */}
                    <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-800 text-center">
                            <strong>Par défaut:</strong><br />
                            Email: admin@sunulamb.com<br />
                            Mot de passe: admin123
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-white/50 text-sm mt-8">
                    © 2025 SunuLamb. Tous droits réservés.
                </p>
            </motion.div>
        </div>
    )
}
