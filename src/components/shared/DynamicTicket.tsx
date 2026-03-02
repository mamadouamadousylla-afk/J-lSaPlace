"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Download, Music, Mic2, Users, Presentation, Sparkles } from "lucide-react"
import Qoder from "./Qoder"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Brand colors from Jël Sa Place logo
export const BRAND_COLORS = {
    jel: "#FFFFFF",      // White for "Jël"
    sa: "#FFD700",       // Yellow for "Sa"
    place: "#4CAF50",    // Green for "Place"
    black: "#000000",
    darkBg: "#1A1A1A",
    gradient: "from-white via-yellow-400 to-green-500"
}

// Category configurations with Jël Sa Place branding
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
        gradient: "from-green-500 via-emerald-500 to-teal-600",
        bgGradient: "from-green-500/10 via-emerald-500/10 to-teal-600/10",
        accentColor: BRAND_COLORS.place,
        textColor: "#059669",
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
        gradient: "from-yellow-400 via-amber-500 to-orange-500",
        bgGradient: "from-yellow-400/10 via-amber-500/10 to-orange-500/10",
        accentColor: BRAND_COLORS.sa,
        textColor: "#D97706",
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
        gradient: "from-yellow-300 via-amber-400 to-yellow-500",
        bgGradient: "from-yellow-300/10 via-amber-400/10 to-yellow-500/10",
        accentColor: "#FBBF24",
        textColor: "#B45309",
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
        gradient: "from-green-400 via-emerald-500 to-teal-600",
        bgGradient: "from-green-400/10 via-emerald-500/10 to-teal-600/10",
        accentColor: "#10B981",
        textColor: "#059669",
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
        gradient: "from-green-500 via-teal-500 to-cyan-600",
        bgGradient: "from-green-500/10 via-teal-500/10 to-cyan-600/10",
        accentColor: "#14B8A6",
        textColor: "#0D9488",
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
    compact = false
}: DynamicTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null)
    
    // Get category config or default to SPORT
    const config = CATEGORY_CONFIG[category?.toUpperCase()] || CATEGORY_CONFIG.SPORT
    
    // Get zone label
    const zoneConfig = config.zoneLabels[zone?.toLowerCase()] || { label: zone, icon: "🎫" }
    
    // Generate QR code value
    const qrValue = qrCode || id

    // Handle PDF download
    const handleDownload = async () => {
        if (onDownload) {
            onDownload()
            return
        }

        if (!ticketRef.current) return

        try {
            // Capture the ticket element as canvas
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            })

            // Create PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            })

            const imgWidth = 210 // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width
            const imgData = canvas.toDataURL('image/png')

            // Add image to PDF (centered)
            const yOffset = (297 - imgHeight) / 2 // Center vertically on A4
            pdf.addImage(imgData, 'PNG', 0, Math.max(0, yOffset), imgWidth, imgHeight)

            // Download the PDF
            pdf.save(`ticket-${id}.pdf`)
        } catch (error) {
            console.error('Error generating PDF:', error)
            // Fallback: create a simple text PDF
            const pdf = new jsPDF()
            pdf.setFontSize(20)
            pdf.setTextColor(0, 0, 0)
            
            // Header
            pdf.setFontSize(24)
            pdf.text('Jel Sa Place - Ticket', 105, 20, { align: 'center' })
            
            pdf.setFontSize(16)
            pdf.text(title, 105, 35, { align: 'center' })
            
            pdf.setFontSize(12)
            let y = 55
            pdf.text(`Date: ${date}`, 20, y)
            pdf.text(`Heure: ${time}`, 120, y)
            
            y += 15
            pdf.text(`Lieu: ${location}`, 20, y)
            
            y += 15
            pdf.text(`Categorie: ${config.label}`, 20, y)
            pdf.text(`Zone: ${zoneConfig.icon} ${zoneConfig.label}`, 120, y)
            
            if (row) {
                y += 15
                pdf.text(`Rangee: ${row}`, 20, y)
            }
            if (seat) {
                pdf.text(`Siege: ${seat}`, 120, y)
            }
            
            y += 15
            pdf.text(`Ticket ID: ${id}`, 20, y)
            
            if (holderName) {
                y += 15
                pdf.text(`Titulaire: ${holderName}`, 20, y)
            }
            
            // Footer
            y += 30
            pdf.setFontSize(10)
            pdf.text('Merci de votre achat !', 105, y, { align: 'center' })
            
            pdf.save(`ticket-${id}.pdf`)
        }
    }

    return (
        <div className="relative w-full max-w-sm mx-auto">
            {/* Main Ticket Card - Ref for PDF capture */}
            <div ref={ticketRef} className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100">
                {/* Hero Image with Gradient Overlay */}
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={imageUrl || config.defaultImage} 
                        alt={title}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-60`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Category Badge with Jël Sa Place branding */}
                    <div className="absolute top-4 left-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20`}>
                            <span className="text-white">{config.icon}</span>
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {config.label}
                            </span>
                        </div>
                    </div>
                    
                    {/* Jël Sa Place Brand Mark */}
                    <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                            <span className="text-xs font-black text-white">Jel</span>
                            <span className="text-xs font-black text-yellow-400">Sa</span>
                            <span className="text-xs font-black text-green-400">Place</span>
                        </div>
                    </div>
                    
                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-xl font-black text-white leading-tight line-clamp-2 drop-shadow-lg">
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
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Rangee</p>
                                    <p className="text-lg font-black" style={{ color: config.textColor }}>{row}</p>
                                </div>
                            )}
                            {row && seat && (
                                <div className="w-px h-8 bg-gray-300/50" />
                            )}
                            {seat && (
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Siege</p>
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

                    {/* Download Button Only */}
                    {!compact && (
                        <div className="pt-2">
                            <button
                                onClick={handleDownload}
                                className={`w-full py-4 rounded-xl bg-gradient-to-r ${config.gradient} text-white font-bold flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all`}
                            >
                                <Download className="w-5 h-5" />
                                Telecharger
                            </button>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -left-3 top-28 w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />
                <div className="absolute -right-3 top-28 w-6 h-6 rounded-full bg-[#F8F9FA] shadow-inner" />
                
                {/* Jël Sa Place Brand Footer */}
                <div className="bg-black py-3 px-4 flex items-center justify-center gap-1">
                    <span className="text-xs font-black text-white">Jel</span>
                    <span className="text-xs font-black text-yellow-400">Sa</span>
                    <span className="text-xs font-black text-green-400">Place</span>
                </div>
            </div>

            {/* Shadow Effect */}
            <div 
                className={`absolute -bottom-4 left-4 right-4 h-8 rounded-[2rem] bg-gradient-to-t ${config.gradient} opacity-20 blur-xl`}
            />
        </div>
    )
}
