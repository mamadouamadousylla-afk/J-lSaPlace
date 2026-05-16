"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Building2, Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionReady, setSessionReady] = useState(false)

    // Supabase sends the token in the URL hash — detect it
    useEffect(() => {
        const handleSession = async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                setSessionReady(true)
            } else {
                setError("Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.")
            }
        }
        handleSession()
    }, [])

    const handleReset = async () => {
        setError(null)
        if (!password || !confirmPassword) {
            setError("Veuillez remplir tous les champs")
            return
        }
        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères")
            return
        }
        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas")
            return
        }

        setLoading(true)
        try {
            const { error: updateError } = await supabase.auth.updateUser({ password })
            if (updateError) {
                setError(updateError.message || "Erreur lors de la mise à jour du mot de passe")
            } else {
                setSuccess(true)
                setTimeout(() => router.push("/promoteur/login"), 3000)
            }
        } catch {
            setError("Erreur de connexion. Réessayez.")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: "url(/fond-lamb.png)", backgroundSize: "300px", backgroundRepeat: "repeat" }} />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white">
                            {success ? "Mot de passe mis à jour !" : "Nouveau mot de passe"}
                        </h1>
                        <p className="text-white/70 text-sm mt-1">Espace Partenaire</p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <div className="text-center space-y-5">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Succès !</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Votre mot de passe a été mis à jour. Vous allez être redirigé vers la page de connexion...
                                    </p>
                                </div>
                                <Link
                                    href="/promoteur/login"
                                    className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                                >
                                    Se connecter
                                </Link>
                            </div>
                        ) : !sessionReady ? (
                            <div className="text-center space-y-4">
                                {error ? (
                                    <>
                                        <p className="text-red-600 text-sm">{error}</p>
                                        <Link
                                            href="/promoteur/mot-de-passe-oublie"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                                        >
                                            Demander un nouveau lien
                                        </Link>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                        <span className="text-gray-500">Vérification du lien...</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <p className="text-sm text-gray-500">
                                    Choisissez un nouveau mot de passe sécurisé pour votre compte partenaire.
                                </p>

                                {/* New password */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minimum 6 caractères"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm outline-none"
                                            autoFocus
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm password */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Répétez le mot de passe"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleReset()}
                                            className={`w-full pl-11 pr-12 py-3.5 rounded-xl bg-gray-50 border text-gray-900 text-sm outline-none transition-colors ${
                                                confirmPassword && password !== confirmPassword
                                                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                                                    : "border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                                            }`}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                                    )}
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleReset}
                                    disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                                    className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                        loading || !password || !confirmPassword || password !== confirmPassword
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                                    }`}
                                >
                                    {loading
                                        ? <><Loader2 className="w-5 h-5 animate-spin" />Mise à jour...</>
                                        : <>Mettre à jour <ArrowRight className="w-5 h-5" /></>
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
