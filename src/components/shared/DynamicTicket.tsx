"use client"

import { motion } from "framer-motion"
import { Calendar, MapPin, QrCode, Download, Wallet, Music, Mic2, Users, Presentation, Sparkles, Ticket } from "lucide-react"
import Qoder from "./Qoder"

// Category configurations with colors, icons, and gradients
export const CATEGORY_CONFIG: Record<string, {
    label: string
    icon: React.ReactNode
    gradient: string
    bgGradient: string
    accentColor: string
    textColor: string
    defaultImage: string
    zoneLabels: Record<string, { label: string; icon: string }>
}> = {
    SPORT: {
        label: "Sport",
        icon: <Sparkles className="w-5 h-5" />,
        gradient: "from-orange-500 via-red-500 to-rose-600",
        bgGradient: "from-orange-500/10 via-red-500/10 to-rose-600/10",
        accentColor: "#F97316",
        textColor: "#EA580C",
        defaultImage: "/hero-combat.png",
        zoneLabels: {
            vip: { label: "VIP Ringside", icon: "🏆" },
            tribune: { label: "Tribune", icon: "🏟️" },
            pelouse: { label: "Pelouse", icon: "🌿" }
        }
    },
    MUSIQUE: {
        label: "Musique",
        icon: <Music className="w-5 h-5" />,
        gradient: "from-purple-500 via-pink-500 to-fuchsia-600",
        bgGradient: "from-purple-500/10 via-pink-500/10 to-fuchsia-600/10",
        accentColor: "#A855F7",
        textColor: "#9333EA",
        defaultImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        zoneLabels: {
            vip: { label: "VIP Backstage", icon: "🎤" },
            tribune: { label: "Tribune Or", icon: "⭐" },
            pelouse: { label: "Fosse Générale", icon: "🎭" }
        }
    },
    HUMOUR: {
        label: "Humour",
        icon: <Mic2 className="w-5 h-5" />,
        gradient: "from-yellow-400 via-amber-500 to-orange-500",
        bgGradient: "from-yellow-400/10 via-amber-500/10 to-orange-500/10",
        accentColor: "#F59E0B",
        textColor: "#D97706",
        defaultImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
        zoneLabels: {
            vip: { label: "Premium", icon: "👑" },
            tribune: { label: "Standard", icon: "😄" },
            pelouse: { label: "Étudiant", icon: "🎓" }
        }
    },
    LOISIRS: {
        label: "Loisirs",
        icon: <Users className="w-5 h-5" />,
        gradient: "from-teal-500 via-cyan-500 to-blue-600",
        bgGradient: "from-teal-500/10 via-cyan-500/10 to-blue-600/10",
        accentColor: "#14B8A6",
        textColor: "#0D9488",
        defaultImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        zoneLabels: {
            vip: { label: "VIP Prestige", icon: "💎" },
            tribune: { label: "Tribune Privilège", icon: "🥂" },
            pelouse: { label: "Accès Général", icon: "🎉" }
        }
    },
    CONFERENCE: {
        label: "Conférence",
        icon: <Presentation className="w-5 h-5" />,
        gradient: "from-blue-600 via-indigo-600 to-violet-700",
        bgGradient: "from-blue-600/10 via-indigo-600/10 to-violet-700/10",
        accentColor: "#6366F1",
        textColor: "#4F46E5",
        defaultImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        zoneLabels: {
            vip: { label: "Business Class", icon: "💼" },
            tribune: { label: "Standard", icon: "📋" },
            pelouse: { label: "Étudiant", icon: "📚" }
        }
    }
}

export interface DynamicTicketProps {
    id: string
    title: string
    date: string
    time: string
    location: string
    category: string
    zone: string
    row?: string
    seat?: string
    imageUrl?: string
    qrCode?: string
    holderName?: string
    onDownload?: () => void
    onAddToWallet?: () => void
    compact?: boolean
}

export default function DynamicTicket({
    id,
    title,
    date,
    time,
    location,
    category,
    zone,
    row,
    seat,
    imageUrl,
    qrCode,
    holderName,
    onDownload,
    onAddToWallet,
    compact = false
}: DynamicTicketProps) {
    // Get category config or default to SPORT
    const config = CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG.SPORT
    
    // Get zone label
    const zoneConfig = config.zoneLabels[zone?.toLowerCase()] || { label: zone, icon: "🎫" }
    
    // Generate QR code value
    const qrValue = qrCode || id

    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Main Ticket Card */}
            <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
                {/* Hero Image with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={imageUrl || config.defaultImage} 
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30`}>
                            <span className="text-white">{config.icon}</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {config.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-black text-white leading-tight line-clamp-2">
                            {title}
                        </h2>
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-5 space-y-5">
                    {/* Event Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 mt-0.5" style={{ color: config.accentColor }} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                    <p className="text-sm font-bold text-gray-900">{date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 mt-0.5" style={{ color: config.accentColor }} />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lieu</p>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">{location}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Heure</p>
                                <p className="text-sm font-bold text-gray-900">{time}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zone</p>
                                <div className="flex items-center gap-1.5">
                                    <span>{zoneConfig.icon}</span>
                                    <p className="text-sm font-bold" style={{ color: config.textColor }}>
                                        {zoneConfig.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seat Info */}
                    {(row || seat) && (
                        <div className={`flex items-center justify-center gap-6 py-3 px-4 rounded-xl bg-gradient-to-r ${config.bgGradient}`}>
                            {row && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rangée</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{row}</p>
                                </div>
                            )}
                            {row && seat && (
                                <div className="w-px h-8 bg-gray-300/50" />
                            )}
                            {seat && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Siège</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{seat}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ticket ID */}
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</p>
                        <p className="text-xs font-mono font-bold text-gray-600">{id}</p>
                    </div>

                    {/* Holder Name */}
                    {holderName && (
                        <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titulaire</p>
                            <p className="text-sm font-bold text-gray-900">{holderName}</p>
                        </div>
                    )}

                    {/* QR Code Section */}
                    {!compact && (
                        <div className="flex flex-col items-center pt-3 border-t border-dashed border-gray-200">
                            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                <Qoder value={qrValue} size={120} />
                            </div>
                            <p className="text-[10px] font-mono text-gray-400 mt-2">
                                Scannez pour valider
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!compact && (
                        <div className="flex gap-3 pt-2">
                            {onAddToWallet && (
                                <button
                                    onClick={onAddToWallet}
                                    className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all`}
                                >
                                    <Wallet className="w-4 h-4" />
                                    Wallet
                                </button>
                            )}
                            {onDownload && (
                                <button
                                    onClick={onDownload}
                                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />
                <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />
            </div>

            {/* Shadow Effect */}
            <div 
                className={`absolute -bottom-4 left-4 right-4 h-8 rounded-[2rem] bg-gradient-to-t ${config.gradient} opacity-20 blur-xl`}
            />
        </div>
    )
}
