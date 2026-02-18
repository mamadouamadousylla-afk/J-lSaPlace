"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Ticket } from "lucide-react"
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
                className="inline-block w-72 rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm h-full"
            >
                <div className="relative h-48 w-full">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase", statusColors[status])}>
                            {statusLabels[status]}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <h3 className="font-poppins font-bold text-lg text-white leading-tight line-clamp-2">{title}</h3>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{location}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div>
                            <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider">À partir de</p>
                            <p className="font-poppins font-bold text-primary text-xl">{formatPrice(price)}</p>
                        </div>
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    )
}
