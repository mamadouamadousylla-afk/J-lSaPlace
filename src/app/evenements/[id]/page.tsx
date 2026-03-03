"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, MapPin, Info, ArrowLeft, ShieldCheck, Share2, Heart, User, Navigation } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/context/FavoritesContext"
import BookingModal from "@/components/shared/BookingModal"

// Google Maps types
declare global {
    interface Window {
        google: any;
    }
}

interface EventData {
    id: string
    title: string
    date: string
    time: string
    category: string
    tag: string
    price_vip: number
    price_tribune: number
    price_pelouse: number
    location: string
    address: string
    image_url: string
    description: string
    promoter: string
    promoter_logo: string
    promoter_description: string
    latitude: number
    longitude: number
}

export default function EventDetail() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [event, setEvent] = useState<EventData | null>(null)
    const [loading, setLoading] = useState(true)
    const [mapLoaded, setMapLoaded] = useState(false)

    useEffect(() => {
        async function loadEvent() {
            if (!id) return
            
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", id)
                .single()

            if (error) {
                console.error("Erreur lors du chargement de l'événement:", error.message, error.code, error.details)
                console.error("Erreur complète:", JSON.stringify(error, null, 2))
            } else if (data) {
                setEvent(data)
            }
            setLoading(false)
        }

        loadEvent()
    }, [id])

    // Charger Google Maps quand l'événement est chargé avec des coordonnées
    useEffect(() => {
        if (!event?.latitude || !event?.longitude || mapLoaded) return

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        if (!apiKey) return

        // Fonction pour initialiser la carte
        const initMap = () => {
            const mapElement = document.getElementById('event-map')
            if (!mapElement || !window.google) return

            const map = new window.google.maps.Map(mapElement, {
                center: { lat: event.latitude, lng: event.longitude },
                zoom: 15,
                disableDefaultUI: true,
                zoomControl: true,
            })

            new window.google.maps.Marker({
                position: { lat: event.latitude, lng: event.longitude },
                map: map,
                title: event.location,
            })

            setMapLoaded(true)
        }

        // Vérifier si Google Maps est déjà chargé
        if (window.google && window.google.maps) {
            initMap()
            return
        }

        // Vérifier si le script est déjà en cours de chargement
        const existingScript = document.getElementById('google-maps-script-event')
        if (existingScript) {
            existingScript.addEventListener('load', initMap)
            return
        }

        // Charger le script Google Maps
        const script = document.createElement('script')
        script.id = 'google-maps-script-event'
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
        script.async = true
        script.defer = true
        script.onload = initMap
        
        document.head.appendChild(script)
    }, [event, mapLoaded])

    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const { toggleFavorite, isFavorite } = useFavorites()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D75B6]"></div>
            </div>
        )
    }

    if (!event) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Événement non trouvé.</p>
            </div>
        )
    }

    const fav = isFavorite(event.id)

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Absolute Header */}
            <div className="fixed top-12 left-6 right-6 z-50 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                        <Share2 className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => toggleFavorite(event.id)}
                        className={cn(
                            "p-3 rounded-full backdrop-blur-md border transition-colors",
                            fav
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white/20 border-white/30 text-white"
                        )}
                    >
                        <Heart className={cn("w-6 h-6", fav && "fill-current")} />
                    </button>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-[60vh] w-full">
                <img
                    src={event.image_url || "/hero-combat.png"}
                    alt={event.title}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 via-transparent to-black/20" />
            </div>

            {/* Content */}
            <div className="px-6 -mt-20 relative z-20 space-y-8 pb-32">
                <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-1.5 rounded-full bg-[#2D75B6]/10 text-[#2D75B6] text-[11px] font-bold uppercase tracking-wider">
                            {event.category}
                        </div>
                        <div className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                            {event.tag}
                        </div>
                    </div>

                    <h1 className="text-4xl font-poppins font-bold leading-tight text-gray-900">{event.title}</h1>

                    <div className="grid grid-cols-1 gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#2D75B6]">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{event.date}</p>
                                <p className="text-xs text-gray-500 font-medium">{event.time}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#2D75B6]">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{event.location}</p>
                                <p className="text-xs text-gray-500 font-medium">{event.address}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <section className="px-2 space-y-4">
                    <h2 className="text-xl font-poppins font-bold flex items-center gap-2">
                        <Info className="w-5 h-5 text-[#2D75B6]" />
                        À propos
                    </h2>
                    <p className="text-gray-500 leading-relaxed font-medium">
                        {event.description}
                    </p>
                </section>

                {/* Promoteur */}
                {event.promoter && (
                    <section className="px-2 space-y-4">
                        <h2 className="text-xl font-poppins font-bold flex items-center gap-2">
                            <User className="w-5 h-5 text-[#2D75B6]" />
                            Organisé par
                        </h2>
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                            <div className="flex items-center gap-4">
                                {event.promoter_logo ? (
                                    <img 
                                        src={event.promoter_logo} 
                                        alt={event.promoter}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-[#2D75B6]/20"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-[#2D75B6]/10 flex items-center justify-center">
                                        <User className="w-8 h-8 text-[#2D75B6]" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{event.promoter}</h3>
                                    {event.promoter_description && (
                                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                            {event.promoter_description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Carte de localisation */}
                {event.latitude && event.longitude && (
                    <section className="px-2 space-y-4">
                        <h2 className="text-xl font-poppins font-bold flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-[#2D75B6]" />
                            Localisation
                        </h2>
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                            <div 
                                id="event-map" 
                                className="w-full h-48 bg-gray-100"
                            ></div>
                            <div className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{event.location}</p>
                                    <p className="text-xs text-gray-500">{event.address}</p>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-[#2D75B6] text-white text-sm font-bold rounded-full flex items-center gap-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    Itinéraire
                                </a>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-12 inset-x-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsBookingOpen(true)}
                    className="w-full py-5 bg-[#2D75B6] text-white text-xl font-bold rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl shadow-[#2D75B6]/30 transition-all"
                >
                    <ShieldCheck className="w-7 h-7" />
                    Réserver
                </motion.button>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                event={{
                    id: event.id,
                    title: event.title,
                    location: event.location,
                    date: event.date,
                    time: event.time,
                    imageUrl: event.image_url || "/hero-combat.png"
                }}
            />
        </div>
    )
}
