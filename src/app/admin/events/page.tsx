"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit2, Trash2, X, Calendar, MapPin, MoreHorizontal, MapPinned } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { formatPrice, cn } from "@/lib/utils"

// Fonction pour nettoyer le nom du fichier (enlever les caractères spéciaux)
function sanitizeFileName(fileName: string): string {
    // Extraire l'extension
    const lastDotIndex = fileName.lastIndexOf('.')
    const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : ''
    const nameWithoutExt = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName
    
    // Nettoyer le nom : garder uniquement les caractères alphanumériques, tirets et underscores
    const sanitizedName = nameWithoutExt
        .normalize('NFD') // Décomposer les caractères accentués
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-zA-Z0-9_-]/g, '_') // Remplacer les caractères spéciaux par underscore
        .replace(/_+/g, '_') // Remplacer les underscores multiples par un seul
        .slice(0, 50) // Limiter la longueur
    
    return `${sanitizedName}${extension}`
}

// Fonction pour valider le type de fichier
function isValidImageType(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: `Type de fichier non supporté: ${file.type}. Utilisez JPG, PNG, WebP ou GIF.` 
        }
    }
    
    if (file.size > maxSize) {
        return { 
            valid: false, 
            error: `Le fichier est trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 5MB.` 
        }
    }
    
    return { valid: true }
}

// Fonction pour extraire le mois de la date (ex: "28 Novembre 2026 - 15h00" -> "NOVEMBRE")
function extractMonthFromDate(dateString: string): string {
    if (!dateString) return ""
    
    const months: Record<string, string> = {
        "janvier": "JANVIER",
        "février": "FEVRIER", 
        "fevrier": "FEVRIER",
        "mars": "MARS",
        "avril": "AVRIL",
        "mai": "MAI",
        "juin": "JUIN",
        "juillet": "JUILLET",
        "août": "AOUT",
        "aout": "AOUT",
        "septembre": "SEPTEMBRE",
        "octobre": "OCTOBRE",
        "novembre": "NOVEMBRE",
        "décembre": "DECEMBRE",
        "decembre": "DECEMBRE"
    }
    
    // Chercher le mois dans la chaîne de date
    const lowerDate = dateString.toLowerCase()
    for (const [month, upperMonth] of Object.entries(months)) {
        if (lowerDate.includes(month)) {
            return upperMonth
        }
    }
    
    return ""
}

// Google Maps types
declare global {
    interface Window {
        google: any;
        initMap: () => void;
    }
}

// Configuration des catégories et leurs types de places
const CATEGORY_SEAT_TYPES: Record<string, { label: string; key: string; defaultPrice: number }[]> = {
    SPORT: [
        { label: "VIP", key: "vip", defaultPrice: 15000 },
        { label: "Tribune", key: "tribune", defaultPrice: 5000 },
        { label: "Pelouse", key: "pelouse", defaultPrice: 2000 }
    ],
    MUSIQUE: [
        { label: "VIP Backstage", key: "vip", defaultPrice: 50000 },
        { label: "Tribune Or", key: "tribune", defaultPrice: 25000 },
        { label: "Fosse Générale", key: "pelouse", defaultPrice: 10000 }
    ],
    HUMOUR: [
        { label: "Premium", key: "vip", defaultPrice: 20000 },
        { label: "Standard", key: "tribune", defaultPrice: 10000 },
        { label: "Étudiant", key: "pelouse", defaultPrice: 5000 }
    ],
    LOISIRS: [
        { label: "VIP Prestige", key: "vip", defaultPrice: 100000 },
        { label: "Tribune Privilège", key: "tribune", defaultPrice: 50000 },
        { label: "Accès Général", key: "pelouse", defaultPrice: 20000 }
    ],
    CONFERENCE: [
        { label: "Business Class", key: "vip", defaultPrice: 50000 },
        { label: "Standard", key: "tribune", defaultPrice: 25000 },
        { label: "Étudiant", key: "pelouse", defaultPrice: 10000 }
    ]
}

// Catégories disponibles sur le front-end
const FRONTEND_CATEGORIES = [
    { value: "SPORT", label: "Sport" },
    { value: "MUSIQUE", label: "Musique" },
    { value: "HUMOUR", label: "Humour" },
    { value: "LOISIRS", label: "Loisirs" },
    { value: "CONFERENCE", label: "Conférence" }
]

export default function AdminEvents() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'draft'>('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchTerm])

    const [editingEventId, setEditingEventId] = useState<string | null>(null)
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

    const initialFormState = {
        title: "",
        date: "",
        time: "",
        month_label: "",
        category: "SPORT",
        category_id: "sport",
        location: "",
        description: "",
        promoter: "",
        promoter_logo: "",
        promoter_description: "",
        latitude: "",
        longitude: "",
        price_vip: 15000,
        price_tribune: 5000,
        price_pelouse: 2000,
        image_url: "",
        status: "published",
        featured: false
    }
    
    // State for image upload
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [promoterLogoFile, setPromoterLogoFile] = useState<File | null>(null);
    const [promoterLogoPreview, setPromoterLogoPreview] = useState<string | null>(null);
    
    // State for Google Maps
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const googleMapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    // Form state
    const [formData, setFormData] = useState(initialFormState)

    // Load Google Maps API
    const loadGoogleMapsAPI = useCallback(() => {
        if (window.google && window.google.maps) {
            setMapLoaded(true);
            return;
        }

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) {
            existingScript.addEventListener('load', () => setMapLoaded(true));
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);
    }, []);

    // Initialize or update map
    useEffect(() => {
        if (!showMap || !mapLoaded || !mapRef.current) return;

        const lat = parseFloat(formData.latitude) || 14.7167; // Default: Dakar
        const lng = parseFloat(formData.longitude) || -17.4677;

        if (!googleMapRef.current) {
            // Create new map
            googleMapRef.current = new window.google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 14,
                mapTypeControl: false,
                streetViewControl: false,
            });

            // Create marker
            markerRef.current = new window.google.maps.Marker({
                position: { lat, lng },
                map: googleMapRef.current,
                draggable: true,
                animation: window.google.maps.Animation.DROP,
            });

            // Add click listener to map
            googleMapRef.current.addListener('click', (e: any) => {
                const newLat = e.latLng.lat();
                const newLng = e.latLng.lng();
                markerRef.current.setPosition(e.latLng);
                setFormData(prev => ({
                    ...prev,
                    latitude: newLat.toFixed(6),
                    longitude: newLng.toFixed(6)
                }));
            });

            // Add drag end listener to marker
            markerRef.current.addListener('dragend', () => {
                const position = markerRef.current.getPosition();
                setFormData(prev => ({
                    ...prev,
                    latitude: position.lat().toFixed(6),
                    longitude: position.lng().toFixed(6)
                }));
            });
        } else {
            // Update existing map center and marker
            const newCenter = { lat, lng };
            googleMapRef.current.setCenter(newCenter);
            markerRef.current.setPosition(newCenter);
        }
    }, [showMap, mapLoaded, formData.latitude, formData.longitude]);

    useEffect(() => {
        const handleClickOutside = () => setOpenDropdownId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    async function loadEvents() {
        setLoading(true)
        let query = supabase.from("events").select("*").order("created_at", { ascending: false })

        if (filter === 'active') {
            query = query.in("status", ["published", "active"])
        } else if (filter === 'draft') {
            query = query.eq("status", "draft")
        }

        if (debouncedSearchTerm) {
            query = query.ilike("title", `%${debouncedSearchTerm}%`)
        }

        const { data, error } = await query
        
        if (error) {
            console.error("Erreur lors du chargement des événements:", error)
        }
        
        if (data) {
            setEvents(data)
            console.log("Événements chargés:", data.length, data)
        } else {
            setEvents([])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadEvents()

        // Realtime subscription
        const channel = supabase
            .channel('events-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
                loadEvents()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Extraire le mois de la date
        const monthLabel = extractMonthFromDate(formData.date)

        // Prepare the payload
        let payload: any = { 
            ...formData, 
            category_id: formData.category.toLowerCase(),
            month_label: monthLabel, // Ajouter le mois extrait
            // Convertir les coordonnées en nombres
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null
        }

        // Upload de l'image de couverture
        if (imageFile) {
            // Valider le fichier
            const validation = isValidImageType(imageFile)
            if (!validation.valid) {
                alert(validation.error)
                setIsSubmitting(false)
                return
            }
            
            try {
                const sanitizedName = sanitizeFileName(imageFile.name)
                const fileName = `events/${Date.now()}_${sanitizedName}`;
                const { error: uploadError } = await supabase.storage
                    .from('event-images')
                    .upload(fileName, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('event-images')
                    .getPublicUrl(fileName);

                payload.image_url = publicUrlData.publicUrl;
            } catch (error: any) {
                alert("Erreur lors de l'upload de l'image: " + error.message);
                setIsSubmitting(false);
                return;
            }
        }

        // Upload du logo du promoteur
        if (promoterLogoFile) {
            // Valider le fichier
            const validation = isValidImageType(promoterLogoFile)
            if (!validation.valid) {
                alert(validation.error)
                setIsSubmitting(false)
                return
            }
            
            try {
                const sanitizedName = sanitizeFileName(promoterLogoFile.name)
                const fileName = `promoters/${Date.now()}_${sanitizedName}`;
                const { error: uploadError } = await supabase.storage
                    .from('event-images')
                    .upload(fileName, promoterLogoFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('event-images')
                    .getPublicUrl(fileName);

                payload.promoter_logo = publicUrlData.publicUrl;
            } catch (error: any) {
                alert("Erreur lors de l'upload du logo: " + error.message);
                setIsSubmitting(false);
                return;
            }
        }

        let error;
        if (editingEventId) {
            const { error: updateError } = await supabase.from("events").update(payload).eq("id", editingEventId)
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from("events").insert([payload])
            error = insertError;
        }

        setIsSubmitting(false)
        if (!error) {
            handleCloseModal()
            loadEvents()
        } else {
            alert("Erreur : " + error.message)
        }
    }

    const handleCloseModal = () => {
        setIsAdding(false)
        setEditingEventId(null)
        setFormData(initialFormState)
    }

    const handleEdit = (event: any) => {
        setFormData({
            title: event.title || "",
            date: event.date || "",
            time: event.time || "",
            month_label: event.month_label || "",
            category: event.category || "SPORT",
            category_id: event.category_id || "sport",
            location: event.location || "",
            description: event.description || "",
            promoter: event.promoter || "",
            promoter_logo: event.promoter_logo || "",
            promoter_description: event.promoter_description || "",
            latitude: event.latitude?.toString() || "",
            longitude: event.longitude?.toString() || "",
            price_vip: event.price_vip || 15000,
            price_tribune: event.price_tribune || 5000,
            price_pelouse: event.price_pelouse || 2000,
            image_url: event.image_url || "",
            status: event.status || "published",
            featured: event.featured || false
        })
        setImageFile(null); // Reset image file when editing
        setImagePreview(event.image_url || null); // Set preview to current image
        setPromoterLogoFile(null);
        setPromoterLogoPreview(event.promoter_logo || null);
        setEditingEventId(event.id)
        setIsAdding(true)
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from("events").update({ status: newStatus }).eq("id", id)
            if (error) throw error;

            // Optimistic update
            setEvents(events.map(ev => ev.id === id ? { ...ev, status: newStatus } : ev))
        } catch (error: any) {
            alert("Erreur lors de la mise à jour du statut : " + error.message)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
            try {
                const { error } = await supabase.from("events").delete().eq("id", id)
                if (error) throw error;

                // Optimistic update
                setEvents(events.filter(ev => ev.id !== id))
            } catch (error: any) {
                alert("Erreur lors de la suppression : " + error.message)
            }
        }
    }

    return (
        <div className="space-y-6 relative">
            <header className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-[28px] font-poppins font-bold text-gray-900 tracking-tight">Gestion des Événements</h1>
                    <p className="text-gray-500 text-[15px] mt-1">Gérez votre billetterie et suivez vos performances</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher des événements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 pl-11 pr-4 py-3 bg-white border border-gray-100/80 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1A8744]/20 text-[14px] shadow-sm text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-[#1D6F42] text-white px-5 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-[#165a34] transition-colors shadow-sm text-[15px]"
                    >
                        <Plus className="w-5 h-5 -ml-1" strokeWidth={2.5} />
                        Nouvel Événement
                    </button>
                </div>
            </header>

            {/* Filters Row */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                    <button 
                        className={`px-5 py-2 rounded-full border text-sm font-semibold shadow-sm ${
                            filter === 'all' 
                                ? 'border-gray-200 text-gray-900 bg-white' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50'
                        }`}
                        onClick={() => setFilter('all')}
                    >
                        Tous
                    </button>
                    <button 
                        className={`px-5 py-2 rounded-full border text-sm font-semibold shadow-sm ${
                            filter === 'active' 
                                ? 'border-gray-200 text-gray-900 bg-white' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50'
                        }`}
                        onClick={() => setFilter('active')}
                    >
                        En cours
                    </button>
                    <button 
                        className={`px-5 py-2 rounded-full border text-sm font-semibold shadow-sm ${
                            filter === 'draft' 
                                ? 'border-gray-200 text-gray-900 bg-white' 
                                : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/50'
                        }`}
                        onClick={() => setFilter('draft')}
                    >
                        Brouillons
                    </button>
                </div>

                <div className="flex items-center gap-5 text-[13px] font-medium text-gray-500">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#1A8744]"></div> En cours</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Brouillon</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div> Épuisé</div>
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-12 text-center text-gray-400 font-medium bg-white rounded-3xl">
                        Chargement des événements...
                    </div>
                ) : events.map((event, idx) => {
                    const isSoldOut = event.status === 'sold_out';
                    const isActive = event.status === 'published';
                    const isDraft = event.status === 'draft';

                    const totalTickets = 5000;
                    const soldTickets = isSoldOut ? 5000 : (isActive ? Math.floor(Math.random() * 4000) + 1000 : 0);
                    const percentSold = (soldTickets / totalTickets) * 100;
                    const progressColor = isSoldOut ? 'bg-[#3B82F6]' : 'bg-[#1D6F42]';

                    return (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{ zIndex: openDropdownId === event.id ? 50 : 1 }}
                            className="relative bg-white p-5 lg:pl-5 lg:pr-8 rounded-[24px] shadow-sm border border-gray-50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                        >
                            {/* 1. Image Box */}
                            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-[#F0FDF4] flex items-center justify-center p-0.5 relative">
                                <img src={event.image_url || "/hero-combat.png"} className="w-full h-full object-cover rounded-[14px]" />
                            </div>

                            {/* 2. Title & Info */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-gray-900 text-[17px] truncate font-poppins">{event.title}</h3>
                                    {event.featured && (
                                        <span className="flex-shrink-0 text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                                            <span>⭐</span> Carrousel
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-[13px] text-gray-400 font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4" />
                                        <span>{event.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 truncate">
                                        <MapPin className="w-4 h-4" />
                                        <span className="truncate">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Sales Trend */}
                            <div className="hidden lg:flex flex-col w-32 shrink-0 border-l border-gray-100 px-6 h-12 justify-center">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Tendance Ventes</span>
                                <div className="flex items-end gap-1 h-5">
                                    {/* Mock small bars */}
                                    {[30, 50, 40, 70, 60, 90, 100].map((h, i) => (
                                        <div key={i} className={`w-[3px] rounded-t-[1px] ${isActive ? 'bg-[#1D6F42]' : 'bg-gray-200'}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Tickets Progress */}
                            <div className="hidden md:flex flex-col w-48 shrink-0 border-l border-gray-100 pl-6 h-12 justify-center">
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-[17px] font-bold text-gray-900">{soldTickets.toLocaleString()}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isSoldOut ? 'text-[#3B82F6]' : 'text-gray-400'}`}>
                                        {isSoldOut ? 'Épuisé' : `${Math.round(100 - percentSold)}% Restant`}
                                    </span>
                                </div>
                                <div className="h-[3px] w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${percentSold}%` }}></div>
                                </div>
                            </div>

                            {/* 5. Price */}
                            <div className="flex flex-col items-start w-28 shrink-0 border-l border-gray-100 pl-6 lg:pl-8 h-12 justify-center">
                                <span className="text-[15px] font-bold text-gray-900">{formatPrice(event.price_vip)}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">FCFA / Billet</span>
                            </div>

                            {/* 6. Actions */}
                            <div className="flex items-center gap-2 shrink-0 border-l border-gray-100 pl-4 lg:pl-8 h-12">
                                <button onClick={() => handleEdit(event)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors shadow-sm">
                                    <Edit2 className="w-[15px] h-[15px] -ml-0.5" />
                                </button>
                                
                                {/* Bouton de suppression direct */}
                                <button 
                                    onClick={() => handleDelete(event.id)}
                                    className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                                >
                                    <Trash2 className="w-[15px] h-[15px] -ml-0.5" />
                                </button>
                                
                                <div className="relative">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === event.id ? null : event.id) }}
                                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors shadow-sm ${openDropdownId === event.id ? 'bg-gray-100 border-gray-200 text-gray-900' : 'border-gray-100 text-gray-400 hover:text-gray-900 hover:border-gray-300'}`}
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>

                                    <AnimatePresence>
                                        {openDropdownId === event.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-50 overflow-hidden"
                                            >
                                                {event.status !== 'published' && (
                                                    <button onClick={() => { handleStatusChange(event.id, 'published'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">Mettre en ligne</button>
                                                )}
                                                {event.status !== 'draft' && (
                                                    <button onClick={() => { handleStatusChange(event.id, 'draft'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">Placer en brouillon</button>
                                                )}
                                                {event.status !== 'archived' && (
                                                    <button onClick={() => { handleStatusChange(event.id, 'archived'); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm font-medium text-gray-700">Archiver</button>
                                                )}
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button onClick={() => { handleDelete(event.id); setOpenDropdownId(null); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm font-bold text-red-600 flex items-center gap-2">
                                                    <Trash2 className="w-[14px] h-[14px]" /> Supprimer
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Modal Add Event */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                                <h2 className="text-xl font-bold font-poppins text-gray-900">{editingEventId ? "Modifier l'événement" : "Créer un événement"}</h2>
                                <button onClick={handleCloseModal} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 bg-[#F8F9FA]">
                                <form id="add-event-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-5">
                                        {/* Titre */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Titre de l'événement</label>
                                            <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm" placeholder="Ex: Modou Lô vs Sa Thiès" />
                                        </div>

                                        {/* Image Couverture - Déplacée ici */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Image Couverture</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input 
                                                        type="file" 
                                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Valider le fichier côté client
                                                                const validation = isValidImageType(file)
                                                                if (!validation.valid) {
                                                                    alert(validation.error)
                                                                    e.target.value = '' // Reset input
                                                                    return
                                                                }
                                                                setImageFile(file);
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setImagePreview(reader.result as string);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <div className="text-gray-400 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600 text-center">
                                                        <span className="font-semibold text-[#1A8744]">Télécharger une image</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF jusqu'à 5MB</p>
                                                </label>
                                                {(imagePreview || formData.image_url) && (
                                                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 relative">
                                                        <img 
                                                            src={imagePreview || formData.image_url} 
                                                            alt="Aperçu" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        {imagePreview && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setImageFile(null);
                                                                    setImagePreview(null);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* À propos */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1A8744]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                À propos de l'événement
                                            </label>
                                            <textarea 
                                                value={formData.description} 
                                                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                                rows={4}
                                                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm resize-none" 
                                                placeholder="Décrivez l'événement, les artistes/lutteurs participants, ce que le public peut attendre..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Date (ex: 15 MARS)</label>
                                            <input required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm" placeholder="15 MARS" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Heure (ex: 16h00 - 20h00)</label>
                                            <input required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm" placeholder="16h00 - 20h00" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Lieu</label>
                                            <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm" placeholder="Arène Nationale" />
                                        </div>

                                        <div className="col-span-2 mt-2">
                                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 text-sm tracking-wide uppercase">
                                                Prix des Billets (FCFA) - {CATEGORY_SEAT_TYPES[formData.category]?.map(s => s.label).join(', ')}
                                            </h3>
                                        </div>

                                        {CATEGORY_SEAT_TYPES[formData.category]?.map((seatType) => (
                                            <div key={seatType.key}>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Prix {seatType.label}
                                                </label>
                                                <input 
                                                    required 
                                                    value={formData[`price_${seatType.key}` as keyof typeof formData] as number} 
                                                    onChange={e => setFormData({ 
                                                        ...formData, 
                                                        [`price_${seatType.key}`]: parseInt(e.target.value) || 0 
                                                    })} 
                                                    type="number" 
                                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm font-mono" 
                                                    placeholder={seatType.defaultPrice.toString()}
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
                                            <select 
                                                value={formData.category} 
                                                onChange={e => {
                                                    const newCategory = e.target.value;
                                                    const seatTypes = CATEGORY_SEAT_TYPES[newCategory];
                                                    setFormData({ 
                                                        ...formData, 
                                                        category: newCategory,
                                                        // Réinitialiser les prix avec les valeurs par défaut de la nouvelle catégorie
                                                        price_vip: seatTypes?.find(s => s.key === 'vip')?.defaultPrice || 0,
                                                        price_tribune: seatTypes?.find(s => s.key === 'tribune')?.defaultPrice || 0,
                                                        price_pelouse: seatTypes?.find(s => s.key === 'pelouse')?.defaultPrice || 0
                                                    });
                                                }} 
                                                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm"
                                            >
                                                {FRONTEND_CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Types de places: {CATEGORY_SEAT_TYPES[formData.category]?.map(s => s.label).join(', ')}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Promoteur</label>
                                            <input value={formData.promoter} onChange={e => setFormData({ ...formData, promoter: e.target.value })} type="text" className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm" placeholder="Nom du promoteur" />
                                        </div>

                                        {/* Logo du promoteur */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Logo du Promoteur</label>
                                            <div className="flex items-center gap-4">
                                                <label className="flex-1 flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input 
                                                        type="file" 
                                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // Valider le fichier côté client
                                                                const validation = isValidImageType(file)
                                                                if (!validation.valid) {
                                                                    alert(validation.error)
                                                                    e.target.value = '' // Reset input
                                                                    return
                                                                }
                                                                setPromoterLogoFile(file);
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setPromoterLogoPreview(reader.result as string);
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                    <div className="text-gray-400 mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-sm text-gray-600 text-center">
                                                        <span className="font-semibold text-[#1A8744]">Télécharger le logo</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP, GIF jusqu'à 5MB</p>
                                                </label>
                                                {(promoterLogoPreview || formData.promoter_logo) && (
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 relative bg-white">
                                                        <img 
                                                            src={promoterLogoPreview || formData.promoter_logo} 
                                                            alt="Logo promoteur" 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        {promoterLogoPreview && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPromoterLogoFile(null);
                                                                    setPromoterLogoPreview(null);
                                                                }}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Description du promoteur */}
                                        <div className="col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Description du Promoteur</label>
                                            <textarea 
                                                value={formData.promoter_description} 
                                                onChange={e => setFormData({ ...formData, promoter_description: e.target.value })} 
                                                rows={3}
                                                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:border-[#1A8744] focus:ring-1 focus:ring-[#1A8744] outline-none transition-all shadow-sm resize-none" 
                                                placeholder="Description de l'entreprise ou du promoteur..."
                                            />
                                        </div>

                                        {/* Géolocalisation */}
                                        <div className="col-span-2">
                                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
                                                <MapPinned className="w-4 h-4" />
                                                Localisation sur la carte
                                            </h3>
                                            
                                            {/* Bouton pour afficher/masquer la carte */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowMap(!showMap);
                                                    if (!showMap) loadGoogleMapsAPI();
                                                }}
                                                className="mb-4 px-4 py-2 bg-[#1A8744] text-white rounded-lg text-sm font-semibold hover:bg-[#165a34] transition-colors flex items-center gap-2"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                {showMap ? 'Masquer la carte' : 'Choisir sur la carte'}
                                            </button>

                                            {/* Google Map */}
                                            {showMap && (
                                                <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                                    <div 
                                                        ref={mapRef}
                                                        className="w-full h-64 bg-gray-100"
                                                    />
                                                    <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
                                                        💡 Cliquez sur la carte ou déplacez le marqueur pour sélectionner l'emplacement exact
                                                    </div>
                                                </div>
                                            )}

                                            {/* Coordonnées cachées - stockées automatiquement */}
                                            <input type="hidden" value={formData.latitude} />
                                            <input type="hidden" value={formData.longitude} />
                                            
                                            {(formData.latitude && formData.longitude) && (
                                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Position enregistrée: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Hidden fields just for TS/Schema compatibility if they are still required, ideally derived on backend */}
                                        <div className="hidden">
                                            <input value={formData.month_label} onChange={e => setFormData({ ...formData, month_label: e.target.value })} />
                                            <input value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                                        </div>

                                        {/* Carrousel Populaire */}
                                        <div className="col-span-2">
                                            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                                        <span className="text-xl">⭐</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">Afficher dans le carrousel Populaire</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">L&apos;événement apparaîtra en vedette sur la page d&apos;accueil</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                                        formData.featured ? 'bg-amber-500' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                                        formData.featured ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" form="add-event-form" disabled={isSubmitting} className="px-6 py-3 rounded-xl font-bold text-white bg-[#1A8744] hover:bg-green-800 transition-colors shadow-md disabled:opacity-50">
                                    {isSubmitting ? "Enregistrement..." : (editingEventId ? "Enregistrer les modifications" : "Créer l'événement")}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
