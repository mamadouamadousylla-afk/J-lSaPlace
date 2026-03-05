"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Upload, Loader2, Check } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CATEGORIES = [
    { value: "SPORT", label: "Sport" },
    { value: "MUSIQUE", label: "Musique" },
    { value: "HUMOUR", label: "Humour" },
    { value: "LOISIRS", label: "Loisirs" },
    { value: "CONFERENCE", label: "Conférence" },
]

const SEAT_DEFAULTS: Record<string, { vip: number; tribune: number; pelouse: number }> = {
    SPORT: { vip: 15000, tribune: 5000, pelouse: 2000 },
    MUSIQUE: { vip: 50000, tribune: 25000, pelouse: 10000 },
    HUMOUR: { vip: 20000, tribune: 10000, pelouse: 5000 },
    LOISIRS: { vip: 100000, tribune: 50000, pelouse: 20000 },
    CONFERENCE: { vip: 50000, tribune: 25000, pelouse: 10000 },
}

export default function NewEventPage() {
    const router = useRouter()
    const [promoter, setPromoter] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const [form, setForm] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "SPORT",
        price_vip: 15000,
        price_tribune: 5000,
        price_pelouse: 2000,
        seats_vip: 100,
        seats_tribune: 300,
        seats_pelouse: 500,
        status: "published",
    })

    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) setPromoter(JSON.parse(stored))
    }, [])

    const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }))

    const handleCategoryChange = (cat: string) => {
        const defaults = SEAT_DEFAULTS[cat] || SEAT_DEFAULTS.SPORT
        setForm(prev => ({
            ...prev,
            category: cat,
            price_vip: defaults.vip,
            price_tribune: defaults.tribune,
            price_pelouse: defaults.pelouse,
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImageFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!form.title || !form.date || !form.location) {
            setError("Veuillez remplir les champs obligatoires (titre, date, lieu)")
            return
        }
        setLoading(true)
        setError(null)

        let imageUrl = ""
        if (imageFile) {
            const ext = imageFile.name.split(".").pop()
            const filename = `event_${Date.now()}.${ext}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("events")
                .upload(filename, imageFile, { upsert: true })
            if (uploadError) {
                setError("Erreur lors de l'upload de l'image")
                setLoading(false)
                return
            }
            const { data: urlData } = supabase.storage.from("events").getPublicUrl(filename)
            imageUrl = urlData.publicUrl
        }

        // Format month label from date
        const months = ["JANV", "FÉVR", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"]
        const dateObj = new Date(form.date)
        const monthLabel = months[dateObj.getMonth()]

        const { data, error: insertError } = await supabase.from("events").insert({
            title: form.title,
            date: new Date(form.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            time: form.time,
            month_label: monthLabel,
            location: form.location,
            description: form.description,
            category: form.category,
            category_id: form.category.toLowerCase(),
            price_vip: form.price_vip,
            price_tribune: form.price_tribune,
            price_pelouse: form.price_pelouse,
            seats_vip: form.seats_vip,
            seats_tribune: form.seats_tribune,
            seats_pelouse: form.seats_pelouse,
            image_url: imageUrl,
            status: form.status,
            featured: false,
            promoter: promoter?.company_name || "",
            promoter_id: promoter?.id || null,
        }).select().single()

        if (insertError) {
            setError(insertError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setTimeout(() => router.push("/promoteur/evenements"), 1500)
        setLoading(false)
    }

    if (success) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Événement créé !</h2>
            <p className="text-gray-500 text-sm">Redirection vers vos événements...</p>
        </div>
    )

    return (
        <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/promoteur/evenements"
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-poppins font-black text-gray-900">Nouvel événement</h1>
                    <p className="text-sm text-gray-500">Remplissez les informations de votre événement</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            {/* Image Upload */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h2 className="font-bold text-gray-900">Image de l'événement</h2>
                <label className="cursor-pointer block">
                    {imagePreview ? (
                        <div className="relative">
                            <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                            <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                                <span className="text-white text-sm font-bold">Changer l'image</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 transition-colors">
                            <Upload className="w-8 h-8 text-gray-300" />
                            <span className="text-gray-400 text-sm">Cliquez pour uploader une image</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-900">Informations générales</h2>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titre *</label>
                    <input type="text" placeholder="Ex: Grande Finale Eumeu Sène vs Gris Bordeaux"
                        value={form.title} onChange={e => set("title", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
                        <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Heure</label>
                        <input type="time" value={form.time} onChange={e => set("time", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lieu *</label>
                    <input type="text" placeholder="Ex: Arène Nationale de Dakar"
                        value={form.location} onChange={e => set("location", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Catégorie</label>
                    <select value={form.category} onChange={e => handleCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none">
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea placeholder="Décrivez votre événement..." rows={3}
                        value={form.description} onChange={e => set("description", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none resize-none" />
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-900">Tarifs & Places</h2>
                {[
                    { key: "vip", label: "VIP" },
                    { key: "tribune", label: "Tribune" },
                    { key: "pelouse", label: "Pelouse" },
                ].map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label} — Prix (FCFA)</label>
                            <input type="number" min={0}
                                value={(form as any)[`price_${key}`]}
                                onChange={e => set(`price_${key}`, parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label} — Nb Places</label>
                            <input type="number" min={0}
                                value={(form as any)[`seats_${key}`]}
                                onChange={e => set(`seats_${key}`, parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h2 className="font-bold text-gray-900">Statut de publication</h2>
                <div className="flex gap-3">
                    {[
                        { value: "published", label: "Publié", desc: "Visible sur le site" },
                        { value: "draft", label: "Brouillon", desc: "Non visible" },
                    ].map(s => (
                        <button key={s.value} onClick={() => set("status", s.value)}
                            className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all ${form.status === s.value ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-500"}`}>
                            {s.label}
                            <span className="block text-xs font-normal mt-0.5">{s.desc}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Création...</> : "Créer l'événement"}
            </button>
        </div>
    )
}
