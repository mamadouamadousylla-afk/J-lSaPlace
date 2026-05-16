"use client"

import { useState } from "react"
import { Building2, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!email) {
            setError("Veuillez entrer votre adresse email")
            return
        }
        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            })
            const data = await res.json()

            if (res.ok) {
                setSent(true)
            } else {
                setError(data.error || "Une erreur est survenue")
            }
        } catch {
            setError("Erreur de connexion. Réessayez.")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="fixed inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: "url(/fond-lamb.png)", backgroundSize: "300px", backgroundRepeat: "repeat" }} />

            <div className="w-full max-w-md relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-white">Mot de passe oublié</h1>
                        <p className="text-white/70 text-sm mt-1">
                            {sent ? "Email envoyé !" : "Entrez votre email d'inscription"}
                        </p>
                    </div>

                    <div className="p-8">
                        {sent ? (
                            /* Success state */
                            <div className="text-center space-y-5">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Email envoyé !</h2>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                        Si l'adresse <span className="font-semibold text-gray-700">{email}</span> est
                                        associée à un compte partenaire, vous recevrez un lien de réinitialisation
                                        dans quelques minutes.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Vérifiez aussi vos spams si vous ne le voyez pas.
                                    </p>
                                </div>
                                <Link
                                    href="/promoteur/login"
                                    className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        ) : (
                            /* Form state */
                            <div className="space-y-5">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Entrez l'adresse email avec laquelle vous vous êtes inscrit en tant que partenaire.
                                    Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                                </p>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        Adresse email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="exemple@email.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 text-gray-900 text-sm font-medium outline-none"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !email}
                                    className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
                                        loading || !email
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                                    }`}
                                >
                                    {loading
                                        ? <><Loader2 className="w-5 h-5 animate-spin" />Envoi en cours...</>
                                        : <>Envoyer le lien <ArrowRight className="w-5 h-5" /></>
                                    }
                                </button>

                                <Link
                                    href="/promoteur/login"
                                    className="flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
