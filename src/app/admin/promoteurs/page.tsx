"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Building2, Check, X, Clock, Phone, Mail, User, Eye, EyeOff, KeyRound, RefreshCw, Copy, CheckCheck } from "lucide-react"

interface Promoter {
    id: string
    company_name: string
    contact_name: string
    phone: string
    email?: string
    description?: string
    website?: string
    status: "pending" | "approved" | "rejected"
    admin_note?: string
    created_at: string
    approved_at?: string
    user_id?: string
}

export default function AdminPromotersPage() {
    const [promoters, setPromoters] = useState<Promoter[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
    const [selected, setSelected] = useState<Promoter | null>(null)
    const [adminNote, setAdminNote] = useState("")
    const [processing, setProcessing] = useState(false)

    // Password state
    const [password, setPassword] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [loadingPassword, setLoadingPassword] = useState(false)
    const [resettingPassword, setResettingPassword] = useState(false)
    const [copied, setCopied] = useState(false)
    const [passwordError, setPasswordError] = useState<string | null>(null)

    useEffect(() => {
        fetchPromoters()
    }, [filter])

    // Reset password state when modal closes/opens
    useEffect(() => {
        if (!selected) {
            setPassword(null)
            setShowPassword(false)
            setPasswordError(null)
            setCopied(false)
        }
    }, [selected])

    const fetchPromoters = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/promoters?status=${filter}`)
            const data = await res.json()
            setPromoters(data.promoters || [])
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const handleAction = async (id: string, status: "approved" | "rejected") => {
        setProcessing(true)
        try {
            const res = await fetch(`/api/promoters/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, admin_note: adminNote })
            })
            if (res.ok) {
                setSelected(null)
                setAdminNote("")
                fetchPromoters()
            }
        } catch (e) {
            console.error(e)
        }
        setProcessing(false)
    }

    const fetchPassword = async (promoterId: string) => {
        setLoadingPassword(true)
        setPasswordError(null)
        try {
            const res = await fetch(`/api/promoters/${promoterId}/password`)
            const data = await res.json()
            if (res.ok) {
                setPassword(data.password || "Non défini")
                setShowPassword(true)
            } else {
                setPasswordError(data.error || "Impossible de récupérer le mot de passe")
            }
        } catch (e) {
            setPasswordError("Erreur de connexion")
        }
        setLoadingPassword(false)
    }

    const resetPassword = async (promoterId: string) => {
        if (!confirm("Voulez-vous générer un nouveau mot de passe pour ce partenaire ?")) return
        setResettingPassword(true)
        setPasswordError(null)
        try {
            const res = await fetch(`/api/promoters/${promoterId}/password`, { method: "POST" })
            const data = await res.json()
            if (res.ok) {
                setPassword(data.newPassword)
                setShowPassword(true)
            } else {
                setPasswordError(data.error || "Impossible de réinitialiser le mot de passe")
            }
        } catch (e) {
            setPasswordError("Erreur de connexion")
        }
        setResettingPassword(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const statusConfig = {
        pending: { label: "En attente", color: "text-yellow-600 bg-yellow-100", icon: Clock },
        approved: { label: "Approuvé", color: "text-green-600 bg-green-100", icon: Check },
        rejected: { label: "Rejeté", color: "text-red-600 bg-red-100", icon: X }
    }

    const pendingCount = promoters.filter(p => p.status === "pending").length

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-poppins font-black text-gray-900">Partenaires</h1>
                    <p className="text-gray-500 mt-1">Gérez les demandes de comptes partenaires</p>
                </div>
                {filter === "pending" && pendingCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-bold">
                        <Clock className="w-4 h-4" />
                        {pendingCount} en attente
                    </div>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
                {(["pending", "approved", "rejected", "all"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                            filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {f === "pending" ? "En attente" : f === "approved" ? "Approuvés" : f === "rejected" ? "Rejetés" : "Tous"}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D75B6]" />
                </div>
            ) : promoters.length === 0 ? (
                <div className="text-center py-16">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Aucun partenaire {filter !== "all" ? `(${filter === "pending" ? "en attente" : filter === "approved" ? "approuvé" : "rejeté"})` : ""}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {promoters.map((p) => {
                        const sc = statusConfig[p.status]
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-6 flex items-center gap-4">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-7 h-7 text-orange-500" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h3 className="font-bold text-gray-900 text-lg">{p.company_name}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${sc.color}`}>
                                                <sc.icon className="w-3 h-3" />
                                                {sc.label}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-1">
                                            <User className="w-3.5 h-3.5 inline mr-1" />{p.contact_name}
                                            <span className="mx-2">•</span>
                                            <Phone className="w-3.5 h-3.5 inline mr-1" />{p.phone}
                                            {p.email && <><span className="mx-2">•</span><Mail className="w-3.5 h-3.5 inline mr-1" />{p.email}</>}
                                        </p>
                                        {p.description && (
                                            <p className="text-gray-400 text-xs mt-1 truncate">{p.description}</p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Soumis le {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => { setSelected(p); setAdminNote(p.admin_note || "") }}
                                            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                            title="Voir les détails"
                                        >
                                            <Eye className="w-5 h-5 text-gray-600" />
                                        </button>
                                        {p.status === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleAction(p.id, "approved")}
                                                    disabled={processing}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleAction(p.id, "rejected")}
                                                    disabled={processing}
                                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                    Rejeter
                                                </button>
                                            </>
                                        )}
                                        {p.status === "approved" && (
                                            <button
                                                onClick={() => handleAction(p.id, "rejected")}
                                                disabled={processing}
                                                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Révoquer
                                            </button>
                                        )}
                                        {p.status === "rejected" && (
                                            <button
                                                onClick={() => handleAction(p.id, "approved")}
                                                disabled={processing}
                                                className="flex items-center gap-1.5 px-4 py-2.5 bg-green-100 text-green-600 rounded-xl font-bold text-sm hover:bg-green-200 transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                Approuver
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Détails du partenaire</h2>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            {/* Basic info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Organisation</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{selected.company_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Responsable</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{selected.contact_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</p>
                                    <p className="font-bold text-gray-900 mt-0.5">{selected.phone}</p>
                                </div>
                                {selected.email && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Email</p>
                                        <p className="font-bold text-gray-900 mt-0.5">{selected.email}</p>
                                    </div>
                                )}
                                {selected.website && (
                                    <div className="col-span-2">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Site web</p>
                                        <p className="font-bold text-[#2D75B6] mt-0.5">{selected.website}</p>
                                    </div>
                                )}
                            </div>

                            {selected.description && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Description</p>
                                    <p className="text-gray-700 mt-1 text-sm leading-relaxed">{selected.description}</p>
                                </div>
                            )}

                            {/* ===== MOT DE PASSE SECTION ===== */}
                            <div className="border border-dashed border-[#2D75B6]/30 rounded-2xl p-4 bg-blue-50/30 space-y-3">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="w-5 h-5 text-[#2D75B6]" />
                                    <p className="font-bold text-gray-800 text-sm">Mot de passe du compte</p>
                                </div>

                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5">
                                        {passwordError}
                                    </div>
                                )}

                                {password !== null ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3">
                                            <span className="flex-1 font-mono text-gray-800 text-sm tracking-widest">
                                                {showPassword ? password : "••••••••"}
                                            </span>
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                title={showPassword ? "Masquer" : "Afficher"}
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => password && copyToClipboard(password)}
                                                className="p-1 text-gray-400 hover:text-[#2D75B6]"
                                                title="Copier"
                                            >
                                                {copied ? <CheckCheck className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 text-center">Communiquez ce mot de passe au partenaire en toute sécurité</p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fetchPassword(selected.id)}
                                        disabled={loadingPassword}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2D75B6] text-white rounded-xl font-bold text-sm hover:bg-[#2560a0] transition-colors disabled:opacity-60"
                                    >
                                        {loadingPassword ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                        {loadingPassword ? "Chargement..." : "Voir le mot de passe"}
                                    </button>
                                )}

                                {/* Reset button always visible */}
                                <button
                                    onClick={() => resetPassword(selected.id)}
                                    disabled={resettingPassword}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-700 rounded-xl font-bold text-sm hover:bg-orange-200 transition-colors disabled:opacity-60"
                                >
                                    {resettingPassword ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    {resettingPassword ? "Génération..." : "Générer un nouveau mot de passe"}
                                </button>
                            </div>

                            {/* Admin note */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Note admin (optionnel)</label>
                                <textarea
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="Raison du rejet ou commentaire..."
                                    rows={3}
                                    className="w-full mt-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm resize-none focus:border-[#2D75B6] focus:outline-none"
                                />
                            </div>

                            {selected.status === "pending" && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(selected.id, "approved")}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                    >
                                        <Check className="w-5 h-5" />
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => handleAction(selected.id, "rejected")}
                                        disabled={processing}
                                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                        Rejeter
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
