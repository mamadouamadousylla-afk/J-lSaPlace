"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Ticket, ChevronRight } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"

interface EventCardProps {
    id: string
    title: string
    date: string
    location: string
    price: number
    imageUrl: string
    status: "disponible" | "presque-complet" | "complet"
}

export default function EventCard({ id, title, date, location, price, imageUrl, status }: EventCardProps) {
    const statusColors = {
        disponible: "bg-green-100 text-green-700",
        "presque-complet": "bg-orange-100 text-orange-700",
        complet: "bg-red-100 text-red-700",
    }

    const statusLabels = {
        disponible: "Disponible",
        "presque-complet": "Presque complet",
        complet: "Complet",
    }

    return (
        <Link href={`/evenements/${id}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className="relative w-72 h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group"
            >
                {/* Full Background Image */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute top-4 right-4">
                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase backdrop-blur-md", statusColors[status])}>
                        {statusLabels[status]}
                    </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 space-y-4">
                    <h3 className="font-poppins font-bold text-xl text-white leading-tight line-clamp-2 drop-shadow-lg">{title}</h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                            <Calendar className="w-4 h-4 text-secondary" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <MapPin className="w-4 h-4 text-secondary" />
                            <span>{location}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-2xl border border-white/10">
                            <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">À partir de</p>
                            <p className="font-poppins font-bold text-secondary text-xl">{formatPrice(price)}</p>
                        </div>
                        <div
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary text-secondary-foreground shadow-lg transform transition-transform group-hover:rotate-45"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
