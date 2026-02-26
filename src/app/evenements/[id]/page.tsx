"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Calendar, MapPin, Info, ArrowLeft, ShieldCheck, Share2, Heart } from "lucide-react"
import { formatPrice, cn } from "@/lib/utils"
import { useState } from "react"
import { getEventById } from "@/lib/events"
import { useFavorites } from "@/context/FavoritesContext"
import BookingModal from "@/components/shared/BookingModal"

export default function EventDetail() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const event = getEventById(id)

    const [isBookingOpen, setIsBookingOpen] = useState(false)
    const { toggleFavorite, isFavorite } = useFavorites()

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
                    src={event.imageUrl}
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
                    Réserver · {formatPrice(event.price)}
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
                    imageUrl: event.imageUrl
                }}
            />
        </div>
    )
}
