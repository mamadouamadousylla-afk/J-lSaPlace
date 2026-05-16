"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Building2, Lock, ArrowRight, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function ResetPasswordForm() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [sessionReady, setSessionReady] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        // Supabase injects the token into the URL hash after redirect
        // We listen to the PASSWORD_RECOVERY event to know when to show the form
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("[RESET] auth event:", event, !!session)
            if (event === "PASSWORD_RECOVERY") {
                setSessionReady(true)
                setChecking(false)
            } else if (event === "SIGNED_IN" && session) {
                // Check if the user arrived via a recovery token (hash contains type=recovery)
                const hash = window.location.hash
                if (hash.includes("type=recovery") || hash.includes("type=signup")) {
                    setSessionReady(true)
                    setChecking(false)
                }
            }
        })

        // Also check the URL hash manually in case the event already fired
        const checkHash = () => {
            const hash = window.location.hash
            if (hash.includes("access_token") && hash.includes("type=recovery")) {
                // Parse the token from hash
                const params = new URLSearchParams(hash.substring(1))
                const accessToken = params.get("access_token")
                const refreshToken = params.get("refresh_token")

                if (accessToken && refreshToken) {
                    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
                        .then(({ error }) => {
                            if (!error) {
                                setSessionReady(true)
                            } else {
                                setError("Lien invalide ou expiré.")
                            }
                            setChecking(false)
                        })
                } else {
                    setError("Lien invalide ou expiré. Demandez un nouveau lien.")
                    setChecking(false)
                }
            } else {
                // Wait a bit for Supabase to process the hash
                setTimeout(() => {
                    if (!sessionReady) {
                        supabase.auth.getSession().then(({ data }) => {
                            if (data.session) {
                                setSessionReady(true)
                            } else {
                                setError("Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.")
                            }
                            setChecking(false)
                        })
                    }
                }, 2000)
            }
        }

        checkHash()

        return () => subscription.unsubscribe()
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
                // Sign out to clean session, then redirect
                await supabase.auth.signOut()
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
                        {/* Loading state */}
                        {checking && !success && (
                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                <p className="text-gray-500 text-sm">Vérification du lien en cours...</p>
                            </div>
                        )}

                        {/* Success */}
                        {!checking && success && (
                            <div className="text-center space-y-5">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Mot de passe mis à jour !</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Vous allez être redirigé vers la page de connexion dans quelques secondes...
                                    </p>
                                </div>
                                <Link
                                    href="/promoteur/login"
                                    className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                                >
                                    Se connecter maintenant
                                </Link>
                            </div>
                        )}

                        {/* Error */}
                        {!checking && !success && !sessionReady && error && (
                            <div className="text-center space-y-5">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <AlertCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Lien invalide</h2>
                                    <p className="text-sm text-gray-500 mt-2">{error}</p>
                                </div>
                                <Link
                                    href="/promoteur/mot-de-passe-oublie"
                                    className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                                >
                                    Demander un nouveau lien
                                </Link>
                                <Link
                                    href="/promoteur/login"
                                    className="block text-sm text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    Retour à la connexion
                                </Link>
                            </div>
                        )}

                        {/* Reset form */}
                        {!checking && !success && sessionReady && (
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
                                                    ? "border-red-300 focus:border-red-400"
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
