"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Building2, Phone, Mail, Globe, FileText, LogOut, Check, Loader2, Edit2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function PromoterProfilPage() {
    const router = useRouter()
    const [promoter, setPromoter] = useState<any>(null)
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saved, setSaved] = useState(false)
    const [form, setForm] = useState({ company_name: "", contact_name: "", phone: "", email: "", description: "", website: "" })

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) {
            const data = JSON.parse(stored)
            setPromoter(data)
            setForm({
                company_name: data.company_name || "",
                contact_name: data.contact_name || "",
                phone: data.phone || "",
                email: data.email || "",
                description: data.description || "",
                website: data.website || "",
            })
        }
    }, [])

    const handleSave = async () => {
        if (!promoter?.id) return
        setLoading(true)
        const { error } = await supabase
            .from("promoters")
            .update({
                company_name: form.company_name,
                contact_name: form.contact_name,
                email: form.email,
                description: form.description,
                website: form.website,
                updated_at: new Date().toISOString(),
            })
            .eq("id", promoter.id)
        if (!error) {
            const updated = { ...promoter, ...form }
            setPromoter(updated)
            localStorage.setItem("promoter_session", JSON.stringify(updated))
            setSaved(true)
            setEditing(false)
            setTimeout(() => setSaved(false), 3000)
        }
        setLoading(false)
    }

    const handleLogout = () => {
        localStorage.removeItem("promoter_session")
        router.push("/promoteur/login")
    }

    const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

    if (!promoter) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
    )

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-poppins font-black text-gray-900">Mon Profil</h1>
                    <p className="text-gray-500 text-sm mt-1">Informations de votre compte promoteur</p>
                </div>
                <button onClick={() => setEditing(!editing)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors">
                    <Edit2 className="w-4 h-4" />
                    {editing ? "Annuler" : "Modifier"}
                </button>
            </div>

            {saved && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    <Check className="w-4 h-4" />
                    Profil mis à jour avec succès
                </div>
            )}

            {/* Status Badge */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${promoter.status === "approved" ? "bg-green-50 border border-green-200" : promoter.status === "pending" ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${promoter.status === "approved" ? "bg-green-500" : promoter.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                <span className={`font-bold text-sm ${promoter.status === "approved" ? "text-green-700" : promoter.status === "pending" ? "text-yellow-700" : "text-red-700"}`}>
                    Compte {promoter.status === "approved" ? "approuvé" : promoter.status === "pending" ? "en attente d'approbation" : "rejeté"}
                </span>
            </div>

            {/* Avatar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-orange-500/20">
                    {promoter.company_name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900">{promoter.company_name}</h2>
                    <p className="text-gray-500 text-sm">{promoter.contact_name}</p>
                    <p className="text-orange-500 text-sm font-bold mt-1">{promoter.phone}</p>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-bold text-gray-900">Informations</h3>

                {[
                    { icon: Building2, label: "Nom de l'organisation", key: "company_name", type: "text", placeholder: "Nom de votre organisation" },
                    { icon: User, label: "Nom du responsable", key: "contact_name", type: "text", placeholder: "Votre nom complet" },
                    { icon: Phone, label: "Téléphone", key: "phone", type: "tel", placeholder: "+221 XX XXX XX XX", disabled: true },
                    { icon: Mail, label: "Email", key: "email", type: "email", placeholder: "contact@exemple.com" },
                    { icon: Globe, label: "Site web", key: "website", type: "url", placeholder: "https://votre-site.com" },
                ].map(({ icon: Icon, label, key, type, placeholder, disabled }) => (
                    <div key={key} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
                        <div className="relative">
                            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type={type} placeholder={placeholder}
                                value={(form as any)[key]}
                                onChange={e => set(key, e.target.value)}
                                disabled={!editing || disabled}
                                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm ${!editing || disabled ? "bg-gray-50 text-gray-500 border border-gray-100" : "bg-gray-50 border border-gray-200 focus:border-orange-400 focus:outline-none text-gray-900"}`} />
                        </div>
                    </div>
                ))}

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />Description
                    </label>
                    <textarea rows={3} placeholder="Décrivez votre organisation..."
                        value={form.description} onChange={e => set("description", e.target.value)}
                        disabled={!editing}
                        className={`w-full px-4 py-3 rounded-xl text-sm resize-none ${!editing ? "bg-gray-50 text-gray-500 border border-gray-100" : "bg-gray-50 border border-gray-200 focus:border-orange-400 focus:outline-none text-gray-900"}`} />
                </div>

                {editing && (
                    <button onClick={handleSave} disabled={loading}
                        className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Sauvegarde...</> : <><Check className="w-4 h-4" />Enregistrer les modifications</>}
                    </button>
                )}
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
                className="w-full py-3.5 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors border border-red-100">
                <LogOut className="w-4 h-4" />
                Se déconnecter
            </button>
        </div>
    )
}
