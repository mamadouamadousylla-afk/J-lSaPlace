"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Upload, Loader2, Check, Building2, X, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

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

// Zones tarifaires par catégorie
const CATEGORY_ZONES: Record<string, { key: string; label: string; placeholder: string }[]> = {
    SPORT: [
        { key: "vip", label: "VIP", placeholder: "Ex: 15000" },
        { key: "tribune_couverte", label: "Tribune couverte", placeholder: "Ex: 10000" },
        { key: "tribune_decouverte", label: "Tribune découverte", placeholder: "Ex: 5000" },
        { key: "pelouse", label: "Pelouse", placeholder: "Ex: 2000" },
    ],
    MUSIQUE: [
        { key: "vip", label: "VIP", placeholder: "Ex: 50000" },
        { key: "loge_prestige", label: "Loge prestige", placeholder: "Ex: 100000" },
        { key: "ticket_simple", label: "Ticket simple", placeholder: "Ex: 15000" },
    ],
    HUMOUR: [
        { key: "vip", label: "VIP", placeholder: "Ex: 25000" },
        { key: "ticket_simple", label: "Ticket simple", placeholder: "Ex: 10000" },
    ],
    CONFERENCE: [
        { key: "vip", label: "VIP", placeholder: "Ex: 30000" },
        { key: "ticket_simple", label: "Ticket simple", placeholder: "Ex: 15000" },
    ],
    LOISIRS: [
        { key: "vip", label: "VIP", placeholder: "Ex: 20000" },
        { key: "ticket_simple", label: "Ticket simple", placeholder: "Ex: 10000" },
    ],
}

const getZonesForCategory = (cat: string) => CATEGORY_ZONES[cat] || CATEGORY_ZONES.SPORT

export default function EditEventPage() {
    const router = useRouter()
    const params = useParams()
    const eventId = params.id as string

    const [promoter, setPromoter] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [loadingEvent, setLoadingEvent] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)

    const [form, setForm] = useState({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        category: "SPORT",
        prices: {} as Record<string, string>,
        seats: {} as Record<string, string>,
        disabledZones: [] as string[],
        customZones: [] as { key: string; label: string; price: string; seats: string }[],
        status: "published" as "published" | "draft",
        existingImageUrl: "",
        existingLogoUrl: "",
    })

    const generateCustomKey = () => `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

    const toggleZone = (key: string) => {
        setForm(prev => {
            const isCurrentlyEnabled = !prev.disabledZones.includes(key)
            return {
                ...prev,
                disabledZones: isCurrentlyEnabled
                    ? [...prev.disabledZones, key]
                    : prev.disabledZones.filter(k => k !== key),
                prices: isCurrentlyEnabled
                    ? { ...prev.prices, [key]: "" }
                    : prev.prices,
                seats: isCurrentlyEnabled
                    ? { ...prev.seats, [key]: "" }
                    : prev.seats
            }
        })
    }

    const isZoneEnabled = (key: string) => !form.disabledZones.includes(key)

    const addCustomZone = () => {
        setForm(prev => ({
            ...prev,
            customZones: [...prev.customZones, { key: generateCustomKey(), label: "", price: "", seats: "" }]
        }))
    }

    const removeCustomZone = (key: string) => {
        setForm(prev => ({
            ...prev,
            customZones: prev.customZones.filter(z => z.key !== key)
        }))
    }

    const updateCustomZone = (key: string, field: "label" | "price" | "seats", value: string) => {
        setForm(prev => ({
            ...prev,
            customZones: prev.customZones.map(z => z.key === key ? { ...z, [field]: value } : z)
        }))
    }

    // Load event data
    useEffect(() => {
        const stored = localStorage.getItem("promoter_session")
        if (stored) setPromoter(JSON.parse(stored))

        const loadEvent = async () => {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single()

            if (error || !data) {
                setLoadingEvent(false)
                return
            }

            // Parse date for input
            let dateForInput = ""
            if (data.date) {
                // Try to parse various date formats
                const parsed = new Date(data.date)
                if (!isNaN(parsed.getTime())) {
                    dateForInput = parsed.toISOString().split("T")[0]
                }
            }

            // Parse pricing and seats
            const pricing = data.pricing || {}
            const pricingLabels = data.pricing_labels || {}
            const seats = data.seats || {}

            // Build prices and seats objects
            const pricesObj: Record<string, string> = {}
            const seatsObj: Record<string, string> = {}
            const customZonesList: { key: string; label: string; price: string; seats: string }[] = []
            const disabledZonesList: string[] = []

            const categoryZones = getZonesForCategory(data.category || "SPORT")
            const categoryZoneKeys = categoryZones.map(z => z.key)

            Object.keys(pricing).forEach(key => {
                if (categoryZoneKeys.includes(key)) {
                    pricesObj[key] = String(pricing[key] || "")
                    seatsObj[key] = String(seats[key] || "")
                    // If price is 0 or empty, mark as disabled
                    if (!pricing[key]) {
                        disabledZonesList.push(key)
                    }
                } else {
                    // Custom zone
                    customZonesList.push({
                        key,
                        label: pricingLabels[key] || key,
                        price: String(pricing[key] || ""),
                        seats: String(seats[key] || "")
                    })
                }
            })

            setForm({
                title: data.title || "",
                date: dateForInput,
                time: data.time || "",
                location: data.location || "",
                description: data.description || "",
                category: data.category || "SPORT",
                prices: pricesObj,
                seats: seatsObj,
                disabledZones: disabledZonesList,
                customZones: customZonesList,
                status: data.status || "published",
                existingImageUrl: data.image_url || "",
                existingLogoUrl: data.promoter_logo || "",
            })
            setImagePreview(data.image_url || null)
            setLogoPreview(data.promoter_logo || null)
            setLoadingEvent(false)
        }

        if (eventId) loadEvent()
    }, [eventId])

    const handleCategoryChange = (cat: string) => {
        setForm(prev => ({ ...prev, category: cat, prices: {}, seats: {}, disabledZones: [], customZones: [] }))
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setLogoFile(file)
        const reader = new FileReader()
        reader.onload = () => setLogoPreview(reader.result as string)
        reader.readAsDataURL(file)
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
        const zones = getZonesForCategory(form.category)
        const enabledZones = zones.filter(z => isZoneEnabled(z.key))
        const missingPrices = enabledZones.filter(z => !form.prices[z.key])
        const missingSeats = enabledZones.filter(z => !form.seats[z.key])

        const totalZones = enabledZones.length + form.customZones.length
        if (totalZones === 0) {
            setError("Veuillez activer au moins une zone tarifaire")
            return
        }

        const incompleteCustomZones = form.customZones.filter(z => !z.label.trim() || !z.price || !z.seats)

        if (missingPrices.length > 0) {
            setError(`Veuillez renseigner les prix pour: ${missingPrices.map(z => z.label).join(", ")}`)
            return
        }
        if (missingSeats.length > 0) {
            setError(`Veuillez renseigner le nombre de places pour: ${missingSeats.map(z => z.label).join(", ")}`)
            return
        }
        if (incompleteCustomZones.length > 0) {
            setError("Veuillez compléter toutes les zones de tarifs personnalisées (nom, prix et nombre de places)")
            return
        }
        setLoading(true)
        setError(null)

        let logoUrl = form.existingLogoUrl
        if (logoFile) {
            const sanitizedLogo = logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
            const logoPath = `logos/${Date.now()}_${sanitizedLogo}`
            const { error: logoUploadError } = await supabase.storage
                .from("event-images")
                .upload(logoPath, logoFile, { cacheControl: "3600", upsert: false })
            if (!logoUploadError) {
                const { data: logoUrlData } = supabase.storage.from("event-images").getPublicUrl(logoPath)
                logoUrl = logoUrlData.publicUrl
            }
        }

        let imageUrl = form.existingImageUrl
        if (imageFile) {
            const sanitizedName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')
            const filename = `events/${Date.now()}_${sanitizedName}`
            const { error: uploadError } = await supabase.storage
                .from("event-images")
                .upload(filename, imageFile, { cacheControl: "3600", upsert: false })
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(filename)
                imageUrl = urlData.publicUrl
            }
        }

        const months = ["JANVIER", "FÉVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOÛT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DÉCEMBRE"]
        const dateObj = new Date(form.date)
        const monthLabel = months[dateObj.getMonth()]

        const pricing: Record<string, number> = {}
        const pricingLabels: Record<string, string> = {}
        const seatsData: Record<string, number> = {}
        const categoryZones = getZonesForCategory(form.category)

        categoryZones.filter(z => isZoneEnabled(z.key)).forEach(z => {
            pricing[z.key] = parseInt(form.prices[z.key] || "0") || 0
            pricingLabels[z.key] = z.label
            seatsData[z.key] = parseInt(form.seats[z.key] || "0") || 0
        })

        form.customZones.forEach(z => {
            pricing[z.key] = parseInt(z.price || "0") || 0
            pricingLabels[z.key] = z.label
            seatsData[z.key] = parseInt(z.seats || "0") || 0
        })

        const { error: updateError } = await supabase.from("events").update({
            title: form.title,
            date: new Date(form.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            time: form.time,
            month_label: monthLabel,
            location: form.location,
            description: form.description,
            category: form.category,
            category_id: form.category.toLowerCase(),
            pricing,
            pricing_labels: pricingLabels,
            seats: seatsData,
            price_vip: pricing.vip || pricing[Object.keys(pricing)[0]] || 0,
            price_tribune: pricing.tribune_couverte || pricing.tribune_decouverte || pricing.ticket_simple || 0,
            price_pelouse: pricing.pelouse || 0,
            image_url: imageUrl,
            promoter_logo: logoUrl,
            status: form.status,
        }).eq("id", eventId)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setTimeout(() => router.push("/promoteur/evenements"), 1500)
        setLoading(false)
    }

    if (loadingEvent) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        )
    }

    if (success) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Événement modifié !</h2>
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
                    <h1 className="text-2xl font-poppins font-black text-gray-900">Modifier l'événement</h1>
                    <p className="text-sm text-gray-500">Modifiez les informations de votre événement</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
            )}

            {/* Logo du partenaire */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div>
                    <h2 className="font-bold text-gray-900">Logo du partenaire</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Votre logo sera affiché sur la page de l'événement</p>
                </div>
                <div className="flex items-start gap-3">
                    <label className="cursor-pointer block">
                        {logoPreview ? (
                            <div className="relative w-28 h-28">
                                <img src={logoPreview} alt="logo" className="w-28 h-28 object-cover rounded-2xl border-2 border-orange-200" />
                                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">Changer</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 transition-colors">
                                <Building2 className="w-8 h-8 text-gray-300" />
                                <span className="text-gray-400 text-[10px] text-center px-1">Logo partenaire</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                    {logoPreview && (
                        <button
                            type="button"
                            onClick={() => { setLogoFile(null); setLogoPreview(null); setForm(prev => ({ ...prev, existingLogoUrl: "" })) }}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors mt-1"
                        >
                            <X className="w-3.5 h-3.5" />
                            Supprimer
                        </button>
                    )}
                </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h2 className="font-bold text-gray-900">Image de l'événement</h2>
                {imagePreview ? (
                    <div className="space-y-2">
                        <div className="relative">
                            <img src={imagePreview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                        </div>
                        <div className="flex gap-2">
                            <label className="cursor-pointer flex-1">
                                <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Changer l'image
                                </div>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                            <button
                                type="button"
                                onClick={() => { setImageFile(null); setImagePreview(null); setForm(prev => ({ ...prev, existingImageUrl: "" })) }}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Supprimer
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="cursor-pointer block">
                        <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-orange-400 transition-colors">
                            <Upload className="w-8 h-8 text-gray-300" />
                            <span className="text-gray-400 text-sm">Cliquez pour uploader une image</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                )}
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <h2 className="font-bold text-gray-900">Informations générales</h2>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Titre *</label>
                    <input type="text" placeholder="Ex: Grande Finale Eumeu Sène vs Gris Bordeaux"
                        value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
                        <input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Heure</label>
                        <input type="time" value={form.time} onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none" />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lieu *</label>
                    <input type="text" placeholder="Ex: Arène Nationale de Dakar"
                        value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
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
                        value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none resize-none" />
                </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div>
                    <h2 className="font-bold text-gray-900">Tarifs</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Zones pour <span className="font-bold text-orange-500">{CATEGORIES.find(c => c.value === form.category)?.label}</span> — Définissez vos prix en FCFA
                    </p>
                </div>
                
                {/* Zones standards */}
                {getZonesForCategory(form.category).map(({ key, label, placeholder }) => (
                    <div key={key} className={`space-y-2 ${!isZoneEnabled(key) ? "opacity-40" : ""}`}>
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">
                                {label}
                                {!isZoneEnabled(key) && <span className="ml-2 text-red-400">(désactivé)</span>}
                            </label>
                            <button
                                type="button"
                                onClick={() => toggleZone(key)}
                                className={`p-1.5 rounded-lg transition-colors ${isZoneEnabled(key) ? "text-orange-400 hover:text-orange-600 hover:bg-orange-50" : "text-gray-300 hover:text-gray-500 hover:bg-gray-50"}`}
                                title={isZoneEnabled(key) ? "Désactiver cette zone" : "Réactiver cette zone"}
                            >
                                {isZoneEnabled(key) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                        {isZoneEnabled(key) && (
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder={`Prix (FCFA) - ${placeholder}`}
                                        value={form.prices[key] || ""}
                                        onChange={e => setForm(prev => ({
                                            ...prev,
                                            prices: { ...prev.prices, [key]: e.target.value }
                                        }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none"
                                    />
                                </div>
                                <div className="w-36">
                                    <input
                                        type="number"
                                        min={0}
                                        placeholder="Nb. places"
                                        value={form.seats[key] || ""}
                                        onChange={e => setForm(prev => ({
                                            ...prev,
                                            seats: { ...prev.seats, [key]: e.target.value }
                                        }))}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {/* Zones personnalisées */}
                {form.customZones.map((zone) => (
                    <div key={zone.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">
                                Zone personnalisée
                            </label>
                            <button
                                type="button"
                                onClick={() => removeCustomZone(zone.key)}
                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Nom (ex: Gradins)"
                                value={zone.label}
                                onChange={e => updateCustomZone(zone.key, "label", e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none"
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Prix FCFA"
                                value={zone.price}
                                onChange={e => updateCustomZone(zone.key, "price", e.target.value)}
                                className="w-28 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none"
                            />
                            <input
                                type="number"
                                min={0}
                                placeholder="Nb. places"
                                value={zone.seats}
                                onChange={e => updateCustomZone(zone.key, "seats", e.target.value)}
                                className="w-24 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:border-orange-400 focus:outline-none"
                            />
                        </div>
                    </div>
                ))}
                
                {/* Bouton ajouter */}
                <button
                    type="button"
                    onClick={addCustomZone}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-bold">Ajouter un autre type de ticket</span>
                </button>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h2 className="font-bold text-gray-900">Statut de publication</h2>
                <div className="flex gap-3">
                    {[
                        { value: "published", label: "Publié", desc: "Visible sur le site" },
                        { value: "draft", label: "Brouillon", desc: "Non visible" },
                    ].map(s => (
                        <button key={s.value} onClick={() => setForm(prev => ({ ...prev, status: s.value as "published" | "draft" }))}
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
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Modification...</> : "Enregistrer les modifications"}
            </button>
        </div>
    )
}
